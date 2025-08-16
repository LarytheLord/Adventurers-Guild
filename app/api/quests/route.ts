
import { NextResponse } from 'next/server'
import { MockDataService } from '@/lib/mockData'

export async function GET() {
  try {
    const quests = MockDataService.getQuests()
    return NextResponse.json({ success: true, quests })
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch quests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, requirements, difficulty, budget, deadline, tags, company_id, company_name } = await request.json()

    if (!title || !description || !difficulty || !company_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Calculate XP reward based on difficulty
    const xpRewards = { F: 200, D: 400, C: 600, B: 800, A: 1200, S: 2000 }
    const skillRewards = {
      'React Mastery': Math.floor(xpRewards[difficulty as keyof typeof xpRewards] * 0.3),
      'TypeScript': Math.floor(xpRewards[difficulty as keyof typeof xpRewards] * 0.2)
    }

    const questData = {
      title,
      description,
      requirements: requirements || '',
      difficulty: difficulty as 'F' | 'D' | 'C' | 'B' | 'A' | 'S',
      xp_reward: xpRewards[difficulty as keyof typeof xpRewards],
      skill_rewards: skillRewards,
      budget: budget ? parseFloat(budget) : undefined,
      deadline: deadline || undefined,
      status: 'active' as const,
      company_id,
      company_name: company_name || 'Unknown Company',
      tags: tags || []
    }

    const newQuest = MockDataService.createQuest(questData)
    return NextResponse.json({ success: true, quest: newQuest })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
