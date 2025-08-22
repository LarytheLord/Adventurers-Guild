
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id: quest_id } = params

    const { data: applications, error } = await supabase
      .from('quest_applications')
      .select(`
        *,
        users ( id, name, email, avatar_url, bio, github_url, linkedin_url, location, rank, xp )
      `)
      .eq('quest_id', quest_id)

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json(applications, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/quests/[id]/applications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
