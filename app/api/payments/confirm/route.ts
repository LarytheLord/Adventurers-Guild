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

    const { payment_intent_id } = await request.json()

    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    // Verify user owns this payment
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_payments')
      .select('company_id')
      .eq('payment_intent_id', payment_intent_id)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (escrow.company_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Confirm payment
    await PaymentService.confirmEscrowPayment(payment_intent_id)

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and held in escrow'
    })

  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to confirm payment' 
    }, { status: 500 })
  }
}
