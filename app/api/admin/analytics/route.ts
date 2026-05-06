import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Users
    const totalUsers = await prisma.user.count();
    const newUsers7d = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

    const countActiveUsersSince = async (since: Date) => {
      const rows = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT user_id)::int AS count
        FROM (
          SELECT id AS user_id FROM users WHERE updated_at >= ${since}
          UNION
          SELECT user_id FROM quest_assignments WHERE assigned_at >= ${since}
          UNION
          SELECT user_id FROM quest_assignments WHERE completed_at >= ${since}
          UNION
          SELECT user_id FROM quest_submissions WHERE submitted_at >= ${since} AND user_id IS NOT NULL
          UNION
          SELECT user_id FROM quest_completions WHERE completion_date >= ${since}
        ) active_users
      `;

      return rows[0]?.count ?? 0;
    };

    const [activeUsers7d, activeUsers30d] = await Promise.all([
      countActiveUsersSince(sevenDaysAgo),
      countActiveUsersSince(thirtyDaysAgo),
    ]);

    const usersByRoleRaw = await prisma.user.groupBy({ by: ['role'], _count: true });
    const usersByRole = usersByRoleRaw.reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.role]: curr._count }), {});

    const rankDistributionRaw = await prisma.user.groupBy({ by: ['rank'], _count: true });
    const rankDistribution = rankDistributionRaw.reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.rank]: curr._count }), {});

    // Quests
    const totalQuests = await prisma.quest.count();
    const questsByStatusRaw = await prisma.quest.groupBy({ by: ['status'], _count: true });
    const questsByStatus = questsByStatusRaw.reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {});
    
    const availableQuests = (questsByStatus as Record<string, number>)['available'] || 0;
    const inProgressQuests = (questsByStatus as Record<string, number>)['in_progress'] || 0;
    const submittedQuests = (questsByStatus as Record<string, number>)['review'] || 0;
    const completedQuests = (questsByStatus as Record<string, number>)['completed'] || 0;
    
    const completionRate = totalQuests > 0 ? completedQuests / totalQuests : 0;

    const questsByTrackRaw = await prisma.quest.groupBy( { by: ['track'], _count: true });
    const questsByTrack = questsByTrackRaw.reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.track]: curr._count }), {});

    const questsByDifficultyRaw = await prisma.quest.groupBy({ by: ['difficulty'], _count: true });
    const questsByDifficulty = questsByDifficultyRaw.reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.difficulty]: curr._count }), {});

    // Average time to complete (raw SQL for Neon)
    const avgTimeToCompleteResult = await prisma.$queryRaw<[{ avg_days: number | null }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 86400)::float AS avg_days
      FROM quest_assignments
      WHERE status = 'completed' AND completed_at IS NOT NULL AND assigned_at IS NOT NULL
    `;
    const avgTimeToComplete = avgTimeToCompleteResult[0]?.avg_days || 0;

    // Daily buckets (last 30 days) using raw SQL
    const dailyActiveUsers = await prisma.$queryRaw<{ date: Date; count: number }[]>`
      SELECT date, COUNT(DISTINCT user_id)::int AS count
      FROM (
        SELECT DATE_TRUNC('day', updated_at) AS date, id AS user_id FROM users WHERE updated_at >= ${thirtyDaysAgo}
        UNION ALL
        SELECT DATE_TRUNC('day', assigned_at) AS date, user_id FROM quest_assignments WHERE assigned_at >= ${thirtyDaysAgo}
        UNION ALL
        SELECT DATE_TRUNC('day', completed_at) AS date, user_id FROM quest_assignments WHERE completed_at >= ${thirtyDaysAgo}
        UNION ALL
        SELECT DATE_TRUNC('day', submitted_at) AS date, user_id FROM quest_submissions WHERE submitted_at >= ${thirtyDaysAgo} AND user_id IS NOT NULL
        UNION ALL
        SELECT DATE_TRUNC('day', completion_date) AS date, user_id FROM quest_completions WHERE completion_date >= ${thirtyDaysAgo}
      ) daily_activity
      GROUP BY date
      ORDER BY date ASC
    `;

    const dailyQuestCompletions = await prisma.$queryRaw<{ date: Date; count: number }[]>`
      SELECT DATE_TRUNC('day', completed_at) AS date, COUNT(id)::int AS count
      FROM quest_assignments
      WHERE status = 'completed' AND completed_at >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', completed_at)
      ORDER BY date ASC
    `;

    const dailySignups = await prisma.$queryRaw<{ date: Date; count: number }[]>`
      SELECT DATE_TRUNC('day', created_at) AS date, COUNT(id)::int AS count
      FROM users
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

    const processDaily = (data: { date: Date; count: number }[]) => 
      data.map(d => ({ date: d.date.toISOString().split('T')[0], count: d.count }));

    return NextResponse.json({
      totalUsers,
      activeUsersLast7d: activeUsers7d,
      activeUsersLast30d: activeUsers30d,
      newUsersLast7d: newUsers7d,
      usersByRole,
      rankDistribution,
      totalQuests,
      availableQuests,
      completedQuests,
      questCompletionRate: completionRate,
      avgTimeToComplete,
      questsByTrack,
      questsByDifficulty,
      users: {
        total: totalUsers,
        active7d: activeUsers7d,
        active30d: activeUsers30d,
        new7d: newUsers7d,
        byRole: usersByRole,
        rankDistribution,
      },
      quests: {
        total: totalQuests,
        available: availableQuests,
        inProgress: inProgressQuests,
        submitted: submittedQuests,
        completed: completedQuests,
        completionRate,
        avgTimeToComplete,
        byTrack: questsByTrack,
        byDifficulty: questsByDifficulty,
      },
      activity: {
        dailyActiveUsers: processDaily(dailyActiveUsers),
        dailyQuestCompletions: processDaily(dailyQuestCompletions),
        dailySignups: processDaily(dailySignups),
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
