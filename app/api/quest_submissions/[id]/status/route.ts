

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuestWorkflowService } from '@/lib/questWorkflow'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const reviewSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  time_to_complete: z.number().positive().optional(), // in hours
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: submissionId } = params
    const body = await req.json()

    const validation = reviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 })
    }

    const reviewData = validation.data

    // Use the workflow service for proper validation and notifications
    const result = await QuestWorkflowService.reviewSubmission(
      submissionId,
      session.user.id,
      reviewData
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message
    }, { status: 200 })

  } catch (error) {
    console.error('Error in PUT /api/quest_submissions/[id]/status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
