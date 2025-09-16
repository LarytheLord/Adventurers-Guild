import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PaymentService } from '@/lib/paymentService'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = user.role === 'company' || user.role === 'client' ? 'company' : 'student'
    const history = await PaymentService.getPaymentHistory(session.user.id, userRole)

    return NextResponse.json({
      success: true,
      payments: history
    })

  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch payment history' 
    }, { status: 500 })
  }
}
