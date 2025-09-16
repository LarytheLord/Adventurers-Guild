
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuestWorkflowService } from '@/lib/questWorkflow'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const applicationSchema = z.object({
  cover_letter: z.string().min(10, 'Cover letter must be at least 10 characters'),
  proposed_timeline: z.string().min(5, 'Proposed timeline is required'),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quest_id } = params
    const body = await req.json()

    const validation = applicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 })
    }

    const { cover_letter, proposed_timeline } = validation.data

    // Use the workflow service for proper validation and notifications
    const result = await QuestWorkflowService.submitApplication(
      quest_id,
      session.user.id,
      { cover_letter, proposed_timeline }
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      application: result.data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/quests/[id]/apply:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
