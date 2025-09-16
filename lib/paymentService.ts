import { supabase } from './supabase'
import { BusinessLogicService } from './businessLogic'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  client_secret: string
}

export interface EscrowPayment {
  id: string
  quest_id: string
  company_id: string
  adventurer_id: string
  total_amount: number
  adventurer_amount: number
  platform_fee: number
  status: 'pending' | 'held' | 'released' | 'refunded'
  payment_intent_id?: string
  created_at: string
  released_at?: string
}

export class PaymentService {
  private static STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
  private static WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
  
  /**
   * Create payment intent for quest funding (escrow)
   */
  static async createQuestPaymentIntent(questId: string, companyId: string): Promise<PaymentIntent> {
    if (!this.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }
    
    // Get quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('budget, assigned_to, difficulty')
      .eq('id', questId)
      .single()
    
    if (questError || !quest) {
      throw new Error('Quest not found')
    }
    
    if (!quest.assigned_to) {
      throw new Error('Quest not assigned to any adventurer')
    }
    
    // Get adventurer rank for fee calculation
    const { data: adventurer, error: adventurerError } = await supabase
      .from('users')
      .select('rank')
      .eq('id', quest.assigned_to)
      .single()
    
    if (adventurerError || !adventurer) {
      throw new Error('Assigned adventurer not found')
    }
    
    // Calculate payment distribution
    const paymentCalc = BusinessLogicService.calculatePaymentDistribution(
      quest.budget || 1000,
      adventurer.rank as any
    )
    
    // Create payment intent with Stripe
    const stripe = require('stripe')(this.STRIPE_SECRET_KEY)
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentCalc.questBudget * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        quest_id: questId,
        company_id: companyId,
        adventurer_id: quest.assigned_to,
        adventurer_amount: Math.round(paymentCalc.adventurerPayment * 100),
        platform_fee: Math.round(paymentCalc.platformFee * 100),
        type: 'quest_escrow'
      },
      capture_method: 'manual', // Hold funds in escrow
      description: `Quest payment for Quest #${questId}`
    })
    
    // Record escrow payment in database
    const { error: escrowError } = await supabase
      .from('escrow_payments')
      .insert({
        id: paymentIntent.id,
        quest_id: questId,
        company_id: companyId,
        adventurer_id: quest.assigned_to,
        total_amount: paymentCalc.questBudget,
        adventurer_amount: paymentCalc.adventurerPayment,
        platform_fee: paymentCalc.platformFee,
        status: 'pending',
        payment_intent_id: paymentIntent.id
      })
    
    if (escrowError) {
      console.error('Failed to record escrow payment:', escrowError)
      // Should ideally cancel the Stripe payment intent here
      throw new Error('Failed to record payment')
    }
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret
    }
  }
  
  /**
   * Confirm and hold payment in escrow
   */
  static async confirmEscrowPayment(paymentIntentId: string): Promise<void> {
    if (!this.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }
    
    const stripe = require('stripe')(this.STRIPE_SECRET_KEY)
    
    try {
      // Confirm the payment intent
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      
      if (paymentIntent.status === 'requires_capture') {
        // Update escrow status
        const { error } = await supabase
          .from('escrow_payments')
          .update({ status: 'held' })
          .eq('payment_intent_id', paymentIntentId)
        
        if (error) {
          console.error('Failed to update escrow status:', error)
        }
        
        // Update quest status to funded
        const { data: escrow } = await supabase
          .from('escrow_payments')
          .select('quest_id')
          .eq('payment_intent_id', paymentIntentId)
          .single()
        
        if (escrow) {
          await supabase
            .from('quests')
            .update({ status: 'in_progress' })
            .eq('id', escrow.quest_id)
        }
      }
    } catch (error) {
      console.error('Failed to confirm escrow payment:', error)
      throw error
    }
  }
  
  /**
   * Release escrow payment to adventurer (when quest is completed and approved)
   */
  static async releaseEscrowPayment(questId: string): Promise<void> {
    if (!this.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }
    
    // Get escrow payment details
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_payments')
      .select('*')
      .eq('quest_id', questId)
      .eq('status', 'held')
      .single()
    
    if (escrowError || !escrow) {
      throw new Error('No held escrow payment found for this quest')
    }
    
    const stripe = require('stripe')(this.STRIPE_SECRET_KEY)
    
    try {
      // Capture the payment from escrow
      const paymentIntent = await stripe.paymentIntents.capture(escrow.payment_intent_id)
      
      if (paymentIntent.status === 'succeeded') {
        // Create transfer to adventurer (this would require Stripe Connect in real implementation)
        // For now, we'll just mark the payment as released
        
        const { error: updateError } = await supabase
          .from('escrow_payments')
          .update({ 
            status: 'released',
            released_at: new Date().toISOString()
          })
          .eq('id', escrow.id)
        
        if (updateError) {
          console.error('Failed to update escrow status:', updateError)
        }
        
        // Update adventurer's total earnings
        const { error: earningsError } = await supabase
          .from('users')
          .update({
            total_earnings: supabase.rpc('increment', {
              field_name: 'total_earnings',
              x: escrow.adventurer_amount
            })
          })
          .eq('id', escrow.adventurer_id)
        
        if (earningsError) {
          console.error('Failed to update adventurer earnings:', earningsError)
        }
        
        // Create notification for adventurer
        await supabase
          .from('notifications')
          .insert({
            user_id: escrow.adventurer_id,
            title: 'Payment Released!',
            message: `You've received $${escrow.adventurer_amount.toFixed(2)} for completing the quest!`,
            type: 'payment_received',
            data: {
              quest_id: questId,
              amount: escrow.adventurer_amount
            }
          })
      }
    } catch (error) {
      console.error('Failed to release escrow payment:', error)
      throw error
    }
  }
  
  /**
   * Refund escrow payment (if quest is cancelled or disputed)
   */
  static async refundEscrowPayment(questId: string, reason: string): Promise<void> {
    if (!this.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }
    
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_payments')
      .select('*')
      .eq('quest_id', questId)
      .eq('status', 'held')
      .single()
    
    if (escrowError || !escrow) {
      throw new Error('No held escrow payment found for this quest')
    }
    
    const stripe = require('stripe')(this.STRIPE_SECRET_KEY)
    
    try {
      // Cancel the payment intent (refund)
      const paymentIntent = await stripe.paymentIntents.cancel(escrow.payment_intent_id, {
        cancellation_reason: 'requested_by_customer'
      })
      
      if (paymentIntent.status === 'canceled') {
        const { error: updateError } = await supabase
          .from('escrow_payments')
          .update({ status: 'refunded' })
          .eq('id', escrow.id)
        
        if (updateError) {
          console.error('Failed to update escrow status:', updateError)
        }
        
        // Update quest status
        await supabase
          .from('quests')
          .update({ status: 'cancelled' })
          .eq('id', questId)
        
        // Notify company
        await supabase
          .from('notifications')
          .insert({
            user_id: escrow.company_id,
            title: 'Quest Payment Refunded',
            message: `Your payment for quest has been refunded. Reason: ${reason}`,
            type: 'payment_refunded',
            data: {
              quest_id: questId,
              amount: escrow.total_amount,
              reason
            }
          })
      }
    } catch (error) {
      console.error('Failed to refund escrow payment:', error)
      throw error
    }
  }
  
  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(body: string, signature: string): Promise<void> {
    if (!this.STRIPE_SECRET_KEY || !this.WEBHOOK_SECRET) {
      throw new Error('Stripe configuration missing')
    }
    
    const stripe = require('stripe')(this.STRIPE_SECRET_KEY)
    
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, this.WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw new Error('Invalid webhook signature')
    }
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }
  
  private static async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    // Update escrow payment status
    const { error } = await supabase
      .from('escrow_payments')
      .update({ status: 'held' })
      .eq('payment_intent_id', paymentIntent.id)
    
    if (error) {
      console.error('Failed to update escrow on payment success:', error)
    }
  }
  
  private static async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    // Handle failed payment
    const { data: escrow } = await supabase
      .from('escrow_payments')
      .select('quest_id, company_id')
      .eq('payment_intent_id', paymentIntent.id)
      .single()
    
    if (escrow) {
      // Notify company of failed payment
      await supabase
        .from('notifications')
        .insert({
          user_id: escrow.company_id,
          title: 'Payment Failed',
          message: 'Your quest payment failed. Please update your payment method and try again.',
          type: 'payment_failed',
          data: {
            quest_id: escrow.quest_id,
            payment_intent_id: paymentIntent.id
          }
        })
    }
  }
  
  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(userId: string, userRole: 'company' | 'student'): Promise<any[]> {
    const column = userRole === 'company' ? 'company_id' : 'adventurer_id'
    
    const { data, error } = await supabase
      .from('escrow_payments')
      .select(`
        *,
        quest:quests(title, difficulty),
        company:users!escrow_payments_company_id_fkey(name),
        adventurer:users!escrow_payments_adventurer_id_fkey(name)
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Failed to fetch payment history:', error)
      return []
    }
    
    return data || []
  }
  
  /**
   * Get platform revenue analytics
   */
  static async getPlatformRevenue(startDate?: string, endDate?: string): Promise<{
    totalRevenue: number
    totalPaid: number
    pendingRevenue: number
    transactionCount: number
  }> {
    let query = supabase
      .from('escrow_payments')
      .select('platform_fee, status, created_at')
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Failed to fetch revenue data:', error)
      return { totalRevenue: 0, totalPaid: 0, pendingRevenue: 0, transactionCount: 0 }
    }
    
    const releasedPayments = data?.filter(p => p.status === 'released') || []
    const pendingPayments = data?.filter(p => p.status === 'held') || []
    
    const totalRevenue = releasedPayments.reduce((sum, p) => sum + p.platform_fee, 0)
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.platform_fee, 0)
    const totalPaid = data?.reduce((sum, p) => sum + (p.status === 'released' ? p.adventurer_amount : 0), 0) || 0
    
    return {
      totalRevenue,
      totalPaid,
      pendingRevenue,
      transactionCount: data?.length || 0
    }
  }
}
