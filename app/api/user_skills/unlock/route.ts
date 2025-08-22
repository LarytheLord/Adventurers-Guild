
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const unlockSkillSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  skill_id: z.string().uuid('Invalid skill ID'),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()

    const validation = unlockSkillSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { user_id, skill_id } = validation.data

    // Check if the skill is already unlocked for the user
    const { data: existingUserSkill, error: existingUserSkillError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user_id)
      .eq('skill_id', skill_id)
      .single()

    if (existingUserSkillError && existingUserSkillError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing user skill:', existingUserSkillError)
      return NextResponse.json({ error: 'Failed to check existing user skill' }, { status: 500 })
    }

    if (existingUserSkill) {
      return NextResponse.json({ error: 'Skill already unlocked for this user' }, { status: 409 })
    }

    const { data: userSkill, error } = await supabase
      .from('user_skills')
      .insert([
        {
          user_id,
          skill_id,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Error unlocking skill:', error)
      return NextResponse.json({ error: 'Failed to unlock skill' }, { status: 500 })
    }

    return NextResponse.json(userSkill, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/user_skills/unlock:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
