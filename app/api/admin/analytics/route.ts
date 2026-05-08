import { NextRequest, NextResponse } from 'next/server';
import { format, subDays } from 'date-fns';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

const USER_ROLES = ['adventurer', 'company', 'admin'] as const;
const USER_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;
const QUEST_TRACKS = ['OPEN', 'INTERN', 'BOOTCAMP'] as const;
const QUEST_DIFFICULTIES = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;

type CountMap<T extends readonly string[]> = Record<T[number], number>;

function buildCountMap<T extends readonly string[]>(keys: T): CountMap<T> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as CountMap<T>;
}

function buildDailyCountMap(days: number, endDate: Date) {
  const buckets = new Map<string, number>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dateKey = format(subDays(endDate, offset), 'yyyy-MM-dd');
    buckets.set(dateKey, 0);
  }

  return buckets;
}

function buildDailySetMap(days: number, endDate: Date) {
  const buckets = new Map<string, Set<string>>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dateKey = format(subDays(endDate, offset), 'yyyy-MM-dd');
    buckets.set(dateKey, new Set<string>());
  }

  return buckets;
}

function toSeries(map: Map<string, number>) {
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function incrementBucket(map: Map<string, number>, dateValue?: Date | null) {
  if (!dateValue) {
    return;
  }

  const dateKey = format(dateValue, 'yyyy-MM-dd');
  const currentValue = map.get(dateKey);

  if (typeof currentValue === 'number') {
    map.set(dateKey, currentValue + 1);
  }
}

function addUserActivity(
  map: Map<string, Set<string>>,
  dateValue: Date | null | undefined,
  userId: string | null | undefined,
  activeUsersLast7d: Set<string>,
  activeUsersLast30d: Set<string>,
  last7Days: Date,
  last30Days: Date
) {
  if (!dateValue || !userId) {
    return;
  }

  const dateKey = format(dateValue, 'yyyy-MM-dd');
  const usersForDay = map.get(dateKey);

  if (usersForDay) {
    usersForDay.add(userId);
  }

  if (dateValue >= last30Days) {
    activeUsersLast30d.add(userId);
  }

  if (dateValue >= last7Days) {
    activeUsersLast7d.add(userId);
  }
}

export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    const [
      totalUsers,
      newUsersLast7d,
      usersByRoleRaw,
      rankDistributionRaw,
      totalQuests,
      availableQuests,
      completedQuests,
      totalAssignments,
      completedAssignmentsCount,
      inProgressAssignments,
      submittedAssignments,
      questsByTrackRaw,
      questsByDifficultyRaw,
      completedAssignmentDurations,
      updatedUsers,
      assignedActivity,
      submissionActivity,
      completionActivity,
      signupActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['rank'],
        _count: { _all: true },
      }),
      prisma.quest.count(),
      prisma.quest.count({ where: { status: 'available' } }),
      prisma.quest.count({ where: { status: 'completed' } }),
      prisma.questAssignment.count(),
      prisma.questAssignment.count({ where: { status: 'completed' } }),
      prisma.questAssignment.count({ where: { status: { in: ['started', 'in_progress'] } } }),
      prisma.questAssignment.count({ where: { status: { in: ['submitted', 'review'] } } }),
      prisma.quest.groupBy({
        by: ['track'],
        _count: { _all: true },
      }),
      prisma.quest.groupBy({
        by: ['difficulty'],
        _count: { _all: true },
      }),
      prisma.questAssignment.findMany({
        where: {
          status: 'completed',
          completedAt: { not: null },
        },
        select: {
          assignedAt: true,
          completedAt: true,
        },
      }),
      prisma.user.findMany({
        where: {
          updatedAt: { gte: last30Days },
        },
        select: {
          id: true,
          updatedAt: true,
        },
      }),
      prisma.questAssignment.findMany({
        where: {
          assignedAt: { gte: last30Days },
        },
        select: {
          userId: true,
          assignedAt: true,
        },
      }),
      prisma.questSubmission.findMany({
        where: {
          submittedAt: { gte: last30Days },
          userId: { not: null },
        },
        select: {
          userId: true,
          submittedAt: true,
        },
      }),
      prisma.questCompletion.findMany({
        where: {
          completionDate: { gte: last30Days },
        },
        select: {
          userId: true,
          completionDate: true,
        },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: last30Days },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const usersByRole = buildCountMap(USER_ROLES);
    for (const roleGroup of usersByRoleRaw) {
      usersByRole[roleGroup.role] = roleGroup._count._all;
    }

    const rankDistribution = buildCountMap(USER_RANKS);
    for (const rankGroup of rankDistributionRaw) {
      rankDistribution[rankGroup.rank] = rankGroup._count._all;
    }

    const questsByTrack = buildCountMap(QUEST_TRACKS);
    for (const trackGroup of questsByTrackRaw) {
      questsByTrack[trackGroup.track] = trackGroup._count._all;
    }

    const questsByDifficulty = buildCountMap(QUEST_DIFFICULTIES);
    for (const difficultyGroup of questsByDifficultyRaw) {
      questsByDifficulty[difficultyGroup.difficulty] = difficultyGroup._count._all;
    }

    const dailySignupsMap = buildDailyCountMap(30, now);
    signupActivity.forEach(({ createdAt }) => incrementBucket(dailySignupsMap, createdAt));

    const dailyQuestCompletionsMap = buildDailyCountMap(30, now);
    completionActivity.forEach(({ completionDate }) => incrementBucket(dailyQuestCompletionsMap, completionDate));

    const dailyActiveUserMap = buildDailySetMap(30, now);
    const activeUsersLast7d = new Set<string>();
    const activeUsersLast30d = new Set<string>();

    updatedUsers.forEach(({ id, updatedAt }) =>
      addUserActivity(dailyActiveUserMap, updatedAt, id, activeUsersLast7d, activeUsersLast30d, last7Days, last30Days)
    );
    assignedActivity.forEach(({ userId, assignedAt }) =>
      addUserActivity(dailyActiveUserMap, assignedAt, userId, activeUsersLast7d, activeUsersLast30d, last7Days, last30Days)
    );
    submissionActivity.forEach(({ userId, submittedAt }) =>
      addUserActivity(dailyActiveUserMap, submittedAt, userId, activeUsersLast7d, activeUsersLast30d, last7Days, last30Days)
    );
    completionActivity.forEach(({ userId, completionDate }) =>
      addUserActivity(dailyActiveUserMap, completionDate, userId, activeUsersLast7d, activeUsersLast30d, last7Days, last30Days)
    );

    const totalDurationMs = completedAssignmentDurations.reduce((sum, assignment) => {
      if (!assignment.completedAt) {
        return sum;
      }

      return sum + (assignment.completedAt.getTime() - assignment.assignedAt.getTime());
    }, 0);

    const avgTimeToComplete =
      completedAssignmentDurations.length > 0
        ? Number((totalDurationMs / completedAssignmentDurations.length / (1000 * 60 * 60 * 24)).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      userMetrics: {
        totalUsers,
        activeUsersLast7d: activeUsersLast7d.size,
        activeUsersLast30d: activeUsersLast30d.size,
        newUsersLast7d,
        usersByRole,
        rankDistribution,
      },
      questMetrics: {
        totalQuests,
        availableQuests,
        completedQuests,
        questCompletionRate: totalAssignments > 0 ? completedAssignmentsCount / totalAssignments : 0,
        avgTimeToComplete,
        questsByTrack,
        questsByDifficulty,
      },
      activityMetrics: {
        dailyActiveUsers: Array.from(dailyActiveUserMap.entries()).map(([date, users]) => ({
          date,
          count: users.size,
        })),
        dailyQuestCompletions: toSeries(dailyQuestCompletionsMap),
        dailySignups: toSeries(dailySignupsMap),
      },
      funnelMetrics: {
        available: availableQuests,
        inProgress: inProgressAssignments,
        submitted: submittedAssignments,
        completed: completedAssignmentsCount,
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin analytics' }, { status: 500 });
  }
}
