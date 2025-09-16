import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PaymentService } from '@/lib/paymentService'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { quest_id } = await request.json()

    if (!quest_id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    // Verify user is company and owns the quest
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('company_id, status, assigned_to, budget')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (quest.company_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (quest.status !== 'active' && quest.status !== 'in_progress') {
      return NextResponse.json({ error: 'Quest is not in a payable state' }, { status: 400 })
    }

    if (!quest.assigned_to) {
      return NextResponse.json({ error: 'Quest not assigned to any adventurer' }, { status: 400 })
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from('escrow_payments')
      .select('id, status')
      .eq('quest_id', quest_id)
      .single()

    if (existingPayment) {
      return NextResponse.json({ 
        error: 'Payment already exists for this quest',
        payment_status: existingPayment.status 
      }, { status: 409 })
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createQuestPaymentIntent(quest_id, session.user.id)

    return NextResponse.json({
      success: true,
      payment_intent: paymentIntent
    })

  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create payment intent' 
    }, { status: 500 })
  }
}
