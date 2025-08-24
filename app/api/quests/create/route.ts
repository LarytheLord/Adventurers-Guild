

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const questSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['F', 'D', 'C', 'B', 'A', 'S']),
  xp_reward: z.number().int().positive('XP reward must be a positive integer'),
  company_id: z.string().uuid('Invalid company ID'),
  requirements: z.string().optional(),
  skill_rewards: z.record(z.string(), z.number()).optional(),
  budget: z.number().optional(),
  payment_amount: z.number().optional(),
  deadline: z.string().datetime().optional(),
  max_applicants: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await req.json()

    const {
      title,
      description,
      difficulty,
      xp_reward,
      company_id,
      requirements,
      skill_rewards,
      budget,
      payment_amount,
      deadline,
      max_applicants,
      tags,
      attachments,
      is_featured,
    } = body

    const validation = questSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: quest, error } = await supabase
      .from('quests')
      .insert([
        {
          title,
          description,
          difficulty,
          xp_reward,
          company_id,
          requirements,
          skill_rewards,
          budget,
          payment_amount,
          deadline,
          max_applicants,
          tags,
          attachments,
          is_featured,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating quest:', error)
      return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 })
    }

    return NextResponse.json(quest, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/quests/create:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
