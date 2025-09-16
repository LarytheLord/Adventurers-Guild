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
      .select('company_id, status')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (quest.company_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Check if quest is completed
    const { data: submission, error: submissionError } = await supabase
      .from('quest_submissions')
      .select('status')
      .eq('quest_id', quest_id)
      .eq('status', 'approved')
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Quest not completed or approved' }, { status: 400 })
    }

    // Release payment
    await PaymentService.releaseEscrowPayment(quest_id)

    return NextResponse.json({
      success: true,
      message: 'Payment released to adventurer'
    })

  } catch (error) {
    console.error('Release payment error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to release payment' 
    }, { status: 500 })
  }
}
