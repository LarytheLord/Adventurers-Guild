import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/paymentService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    await PaymentService.handleWebhook(body, signature)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Webhook failed' 
    }, { status: 400 })
  }
}
