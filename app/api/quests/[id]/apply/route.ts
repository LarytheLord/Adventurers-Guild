
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const applicationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  cover_letter: z.string().min(1, 'Cover letter is required'),
  proposed_timeline: z.string().min(1, 'Proposed timeline is required'),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id: quest_id } = params
    const body = await req.json()

    const validation = applicationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { user_id, cover_letter, proposed_timeline } = validation.data

    // Check if the user has already applied for this quest
    const { data: existingApplication, error: existingApplicationError } = await supabase
      .from('quest_applications')
      .select('id')
      .eq('quest_id', quest_id)
      .eq('user_id', user_id)
      .single()

    if (existingApplicationError && existingApplicationError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing application:', existingApplicationError)
      return NextResponse.json({ error: 'Failed to check existing application' }, { status: 500 })
    }

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this quest' }, { status: 409 })
    }

    const { data: application, error } = await supabase
      .from('quest_applications')
      .insert([
        {
          quest_id,
          user_id,
          cover_letter,
          proposed_timeline,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/quests/[id]/apply:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
