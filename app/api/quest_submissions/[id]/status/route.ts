

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']),
  rating: z.number().int().min(1).max(5).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: submissionId } = params
    const body = await req.json()

    const validation = statusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { status, rating } = validation.data

    const { data: submission, error } = await supabase
      .from('quest_submissions')
      .update({ status, rating })
      .eq('id', submissionId)
      .select()

    if (error) {
      console.error('Error updating submission status:', error)
      return NextResponse.json({ error: 'Failed to update submission status' }, { status: 500 })
    }

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // If submission is approved, update user's XP and skills
    if (status === 'approved') {
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('xp_reward, skill_rewards, assigned_to')
        .eq('id', submission[0].quest_id)
        .single()

      if (questError || !quest) {
        console.error('Error fetching quest for submission:', questError)
        return NextResponse.json({ error: 'Failed to fetch quest details' }, { status: 500 })
      }

      const { data: userProfile, error: userProfileError } = await supabase
        .from('users')
        .select('xp, rank')
        .eq('id', submission[0].user_id)
        .single()

      if (userProfileError || !userProfile) {
        console.error('Error fetching user profile for submission:', userProfileError)
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
      }

      // Update user's XP
      const newXp = userProfile.xp + quest.xp_reward
      // TODO: Implement rank progression logic based on newXp
      const rankThresholds = {
        F: 0,
        D: 1000,
        C: 5000,
        B: 10000,
        A: 25000,
        S: 50000,
      };

      let newRank = userProfile.rank;
      for (const rankKey in rankThresholds) {
        if (newXp >= rankThresholds[rankKey as keyof typeof rankThresholds]) {
          newRank = rankKey as 'F' | 'D' | 'C' | 'B' | 'A' | 'S';
        }
      }

      await supabase
        .from('users')
        .update({ xp: newXp, rank: newRank })
        .eq('id', submission[0].user_id)

      // Update user's skills
      if (quest.skill_rewards) {
        for (const [skillName, points] of Object.entries(quest.skill_rewards)) {
          const { data: skillData, error: skillError } = await supabase
            .from('skills')
            .select('id, max_level, points_per_level')
            .eq('name', skillName)
            .single()

          if (skillError || !skillData) {
            console.error(`Error fetching skill ${skillName}:`, skillError)
            continue // Skip to next skill if not found
          }

          const { data: userSkill, error: userSkillError } = await supabase
            .from('user_skills')
            .select('level, skill_points')
            .eq('user_id', submission[0].user_id)
            .eq('skill_id', skillData.id)
            .single()

          if (userSkillError && userSkillError.code !== 'PGRST116') {
            console.error('Error fetching user skill:', userSkillError)
            continue
          }

          let newSkillPoints = points as number
          let newLevel = 0

          if (userSkill) {
            newSkillPoints += userSkill.skill_points
            newLevel = Math.floor(newSkillPoints / skillData.points_per_level)
            if (newLevel > skillData.max_level) {
              newLevel = skillData.max_level
            }

            await supabase
              .from('user_skills')
              .update({ skill_points: newSkillPoints, level: newLevel })
              .eq('user_id', submission[0].user_id)
              .eq('skill_id', skillData.id)
          } else {
            newLevel = Math.floor(newSkillPoints / skillData.points_per_level)
            if (newLevel > skillData.max_level) {
              newLevel = skillData.max_level
            }
            await supabase
              .from('user_skills')
              .insert({
                user_id: submission[0].user_id,
                skill_id: skillData.id,
                skill_points: newSkillPoints,
                level: newLevel,
                is_unlocked: true,
                unlocked_at: new Date().toISOString(),
              })
          }
        }
      }
    }

    return NextResponse.json(submission, { status: 200 })
  } catch (error) {
    console.error('Error in PUT /api/quest_submissions/[id]/status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
