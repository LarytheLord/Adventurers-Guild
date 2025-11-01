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

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, level, rank, skill_points')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    // Count completed quests
    const { count: completedCount, error: completedError } = await supabase
      .from('quest_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (completedError) {
      console.error('Error counting completed quests:', completedError);
    }

    // Count active quests
    const { count: activeCount, error: activeError } = await supabase
      .from('quest_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['assigned', 'in_progress']);

    if (activeError) {
      console.error('Error counting active quests:', activeError);
    }

    return NextResponse.json({
      xp: user?.xp || 0,
      level: user?.level || 1,
      rank: user?.rank || 'F',
      skillPoints: user?.skill_points || 0,
      questsCompleted: completedCount || 0,
      activeQuests: activeCount || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
