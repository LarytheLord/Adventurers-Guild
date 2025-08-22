
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const questUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  difficulty: z.enum(['F', 'D', 'C', 'B', 'A', 'S']).optional(),
  xp_reward: z.number().int().positive('XP reward must be a positive integer').optional(),
  requirements: z.string().optional(),
  skill_rewards: z.any().optional(),
  budget: z.number().optional(),
  payment_amount: z.number().optional(),
  deadline: z.string().datetime().optional(),
  max_applicants: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.any().optional(),
  is_featured: z.boolean().optional(),
  status: z.enum(['draft', 'active', 'in_progress', 'completed', 'cancelled']).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await req.json()

    const validation = questUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: quest, error } = await supabase
      .from('quests')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating quest:', error)
      return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 })
    }

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    return NextResponse.json(quest, { status: 200 })
  } catch (error) {
    console.error('Error in PUT /api/quests/update/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
