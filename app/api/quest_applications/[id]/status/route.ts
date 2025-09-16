

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuestWorkflowService } from '@/lib/questWorkflow'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']),
  reviewer_notes: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId } = params
    const body = await req.json()

    const validation = statusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 })
    }

    const { status, reviewer_notes } = validation.data

    // Use the workflow service for proper validation and notifications
    const result = await QuestWorkflowService.reviewApplication(
      applicationId,
      session.user.id,
      { status, reviewer_notes }
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      application: result.data
    }, { status: 200 })

  } catch (error) {
    console.error('Error in PUT /api/quest_applications/[id]/status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
