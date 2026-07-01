// app/api/admin/analytics/route.ts
import { NextRequest } from 'next/server';
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
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';

    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    const daysAgo7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active users (logged in within period)
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', daysAgo.toISOString());

    // Users by role
    const { data: usersByRole } = await supabase
      .from('users')
      .select('role')
      .eq('is_active', true);

    const roleCounts: Record<string, number> = {};
    usersByRole?.forEach(u => {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    });

    // Users registered in period
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', daysAgo.toISOString());

    // Total quests
    const { count: totalQuests } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true });

    // Active quests
    const { count: activeQuests } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['available', 'in_progress']);

    // Completed quests
    const { count: completedQuests } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Quests by category
    const { data: questsByCategory } = await supabase
      .from('quests')
      .select('quest_category');

    const categoryCounts: Record<string, number> = {};
    questsByCategory?.forEach(q => {
      categoryCounts[q.quest_category] = (categoryCounts[q.quest_category] || 0) + 1;
    });

    // Quest assignments stats
    const { data: assignments } = await supabase
      .from('quest_assignments')
      .select('status, completed_at');

    const assignmentStats = {
      assigned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    assignments?.forEach(a => {
      if (a.status === 'assigned') assignmentStats.assigned++;
      else if (a.status === 'in_progress') assignmentStats.in_progress++;
      else if (a.status === 'completed') assignmentStats.completed++;
      else if (a.status === 'cancelled') assignmentStats.cancelled++;
    });

    // Completion rate
    const totalAssignments = assignmentStats.assigned + assignmentStats.in_progress + assignmentStats.completed + assignmentStats.cancelled;
    const completionRate = totalAssignments > 0 ? Math.round((assignmentStats.completed / totalAssignments) * 100) : 0;

    // Recent activity (last 10)
    const { data: recentSubmissions } = await supabase
      .from('quest_submissions')
      .select(`
        submitted_at,
        status,
        users (name, email)
      `)
      .order('submitted_at', { ascending: false })
      .limit(10);

    // XP distribution
    const { data: xpDistribution } = await supabase
      .from('users')
      .select('rank, xp')
      .eq('is_active', true);

    const rankDistribution: Record<string, number> = {};
    xpDistribution?.forEach(u => {
      rankDistribution[u.rank] = (rankDistribution[u.rank] || 0) + 1;
    });

    // New users in last 7 days
    const { count: newUsers7Days } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', daysAgo7.toISOString());

    // New quests in last 7 days
    const { count: newQuests7Days } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', daysAgo7.toISOString());

    return Response.json({
      success: true,
      data: {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          new: newUsers || 0,
          new7Days: newUsers7Days || 0,
          byRole: roleCounts,
        },
        quests: {
          total: totalQuests || 0,
          active: activeQuests || 0,
          completed: completedQuests || 0,
          new7Days: newQuests7Days || 0,
          byCategory: categoryCounts,
        },
        assignments: {
          ...assignmentStats,
          total: totalAssignments,
          completionRate,
        },
        rankDistribution,
        recentActivity: recentSubmissions?.map(s => ({
          date: s.submitted_at,
          user: s.users?.name || 'Unknown',
          action: `Submitted ${s.status} quest`,
        })) || [],
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics', success: false }, { status: 500 });
  }
}
