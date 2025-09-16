

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuestWorkflowService } from '@/lib/questWorkflow'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const submissionSchema = z.object({
  submission_url: z.string().url('Invalid submission URL').optional().or(z.literal("")),
  github_repo: z.string().url('Invalid GitHub URL').optional().or(z.literal("")),
  demo_url: z.string().url('Invalid demo URL').optional().or(z.literal("")),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
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

    const validation = submissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 })
    }

    const submissionData = validation.data

    // Use the workflow service for proper validation and notifications
    const result = await QuestWorkflowService.submitQuestWork(
      quest_id,
      session.user.id,
      submissionData
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      submission: result.data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/quests/[id]/submit:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
