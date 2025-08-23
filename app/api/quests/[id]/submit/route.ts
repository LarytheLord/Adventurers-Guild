

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const submissionSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  submission_url: z.string().url('Invalid URL').optional().or(z.literal("")),
  github_repo: z.string().url('Invalid URL').optional().or(z.literal("")),
  demo_url: z.string().url('Invalid URL').optional().or(z.literal("")),
  description: z.string().min(1, 'Description is required'),
  attachments: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: quest_id } = params
    const body = await req.json()

    const validation = submissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { user_id, submission_url, github_repo, demo_url, description, attachments } = validation.data

    const { data: submission, error } = await supabase
      .from('quest_submissions')
      .insert([
        {
          quest_id,
          user_id,
          submission_url,
          github_repo,
          demo_url,
          description,
          attachments,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/quests/[id]/submit:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
