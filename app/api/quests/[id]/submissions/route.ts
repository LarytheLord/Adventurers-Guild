

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: quest_id } = params

    const { data: submissions, error } = await supabase
      .from('quest_submissions')
      .select(`
        *,
        users ( id, name, email, avatar_url, bio, github_url, linkedin_url, location, rank, xp )
      `)
      .eq('quest_id', quest_id)

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/quests/[id]/submissions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
