import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('quest_assignments')
      .select(`
        id,
        quest_id,
        user_id,
        status,
        assigned_at,
        started_at,
        completed_at,
        progress,
        quests (
          id,
          title,
          description,
          difficulty,
          xp_reward,
          skill_points_reward,
          monetary_reward,
          quest_category,
          deadline
        )
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to handle array access issues
    const quests = (data || []).map((item: any) => {
      const questData = Array.isArray(item.quests) ? item.quests[0] : item.quests;
      return {
        ...item,
        quests: questData
      };
    });

    return NextResponse.json({
      quests,
      success: true
    });
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}
