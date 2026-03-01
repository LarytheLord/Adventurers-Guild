// app/api/analytics/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reportType = searchParams.get('type'); // 'user', 'quest', 'platform'
    const timeRange = searchParams.get('time_range') || '30d'; // 7d, 30d, 90d, 1y
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate user ID if report type requires it
    if (reportType !== 'platform' && !userId) {
      return Response.json({ error: 'User ID is required for user and quest reports', success: false }, { status: 400 });
    }

    if (reportType === 'user') {
      return await getUserAnalytics(userId!, timeRange, startDate || undefined, endDate || undefined);
    } else if (reportType === 'quest') {
      return await getQuestAnalytics(userId!, timeRange, startDate || undefined, endDate || undefined);
    } else if (reportType === 'platform') {
      return await getPlatformAnalytics(timeRange, startDate || undefined, endDate || undefined);
    } else {
      return Response.json({ error: 'Invalid report type. Use: user, quest, or platform', success: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in analytics API:', error);
    return Response.json({ error: 'Failed to fetch analytics', success: false }, { status: 500 });
  }
}

// Get user-specific analytics
async function getUserAnalytics(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      rank: true,
      xp: true,
      skillPoints: true,
      level: true,
      createdAt: true,
      lastLoginAt: true,
      adventurerProfile: {
        select: {
          specialization: true,
          primarySkills: true,
          questCompletionRate: true,
          totalQuestsCompleted: true,
          currentStreak: true,
          maxStreak: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get user's quest statistics
  const totalQuests = await prisma.questAssignment.count({
    where: {
      userId,
      assignedAt: {
        gte: new Date(getStartDate(timeRange, startDate)),
        lte: new Date(getEndDate(endDate)),
      },
    },
  });

  const completedQuests = await prisma.questCompletion.count({
    where: {
      userId,
      completionDate: {
        gte: new Date(getStartDate(timeRange, startDate)),
        lte: new Date(getEndDate(endDate)),
      },
    },
  });

  // Get recent activity
  const recentActivity = await prisma.questCompletion.findMany({
    where: {
      userId,
      completionDate: {
        gte: new Date(getStartDate(timeRange, startDate)),
        lte: new Date(getEndDate(endDate)),
      },
    },
    select: {
      id: true,
      questId: true,
      completionDate: true,
      xpEarned: true,
      skillPointsEarned: true,
      qualityScore: true,
      quest: {
        select: {
          title: true,
          difficulty: true,
          questCategory: true,
        },
      },
    },
    orderBy: { completionDate: 'desc' },
    take: 10,
  });

  // Calculate progress over time
  const progressData = await getProgressData(userId, timeRange, startDate, endDate);

  const profile: any = Array.isArray(user.adventurerProfile) ? user.adventurerProfile[0] : user.adventurerProfile;

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      rank: user.rank,
      xp: user.xp,
      skillPoints: user.skillPoints,
      level: user.level,
      specialization: profile?.specialization,
      primarySkills: profile?.primarySkills,
      questCompletionRate: profile?.questCompletionRate,
      totalQuestsCompleted: profile?.totalQuestsCompleted,
      currentStreak: profile?.currentStreak,
      maxStreak: profile?.maxStreak,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
    },
    stats: {
      totalQuests: totalQuests || 0,
      completedQuests: completedQuests || 0,
      completionRate: totalQuests ? (completedQuests || 0) / totalQuests * 100 : 0,
      xpGained: recentActivity.reduce((sum, item) => sum + (item.xpEarned || 0), 0),
      skillPointsGained: recentActivity.reduce((sum, item) => sum + (item.skillPointsEarned || 0), 0),
    },
    recentActivity,
    progressOverTime: progressData,
    success: true,
  });
}

// Get quest-specific analytics
async function getQuestAnalytics(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get quests created by the user (if company) or assigned to user (if adventurer)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let quests;
  let questStats;

  if (user.role === 'company') {
    // Get quests posted by company
    const companyQuests = await prisma.quest.findMany({
      where: {
        companyId: userId,
        createdAt: {
          gte: new Date(getStartDate(timeRange, startDate)),
          lte: new Date(getEndDate(endDate)),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        questType: true,
        status: true,
        difficulty: true,
        xpReward: true,
        skillPointsReward: true,
        monetaryReward: true,
        requiredSkills: true,
        maxParticipants: true,
        questCategory: true,
        createdAt: true,
        deadline: true,
        _count: {
          select: {
            assignments: true,
            completions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    quests = companyQuests;

    // Calculate company quest statistics
    const totalReward = companyQuests.reduce((sum, quest) => sum + Number(quest.monetaryReward || 0), 0);
    const totalAssigned = companyQuests.reduce((sum, quest) => sum + (quest._count.assignments || 0), 0);
    const totalCompleted = companyQuests.reduce((sum, quest) => sum + (quest._count.completions || 0), 0);

    questStats = {
      totalQuests: companyQuests.length,
      totalRewardSpent: totalReward,
      totalAssigned,
      totalCompleted,
      completionRate: totalAssigned ? (totalCompleted / totalAssigned) * 100 : 0,
    };
  } else {
    // Get quests assigned to adventurer
    const adventurerQuests = await prisma.questAssignment.findMany({
      where: {
        userId,
        assignedAt: {
          gte: new Date(getStartDate(timeRange, startDate)),
          lte: new Date(getEndDate(endDate)),
        },
      },
      select: {
        id: true,
        questId: true,
        status: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        progress: true,
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            questType: true,
            status: true,
            difficulty: true,
            xpReward: true,
            skillPointsReward: true,
            requiredSkills: true,
            questCategory: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    quests = adventurerQuests;

    // Calculate adventurer quest statistics
    const completed = adventurerQuests.filter(q => q.status === 'completed').length;
    const inProgress = adventurerQuests.filter(q => q.status === 'in_progress').length;
    const xpEarned = adventurerQuests.reduce((sum, quest) => {
      if (quest.status === 'completed' && quest.quest) {
        return sum + (quest.quest.xpReward || 0);
      }
      return sum;
    }, 0);

    questStats = {
      totalQuests: adventurerQuests.length,
      completedQuests: completed,
      inProgressQuests: inProgress,
      xpEarned,
      completionRate: adventurerQuests.length ? (completed / adventurerQuests.length) * 100 : 0,
    };
  }

  return Response.json({
    quests,
    stats: questStats,
    success: true,
  });
}

// Get platform-wide analytics
async function getPlatformAnalytics(timeRange: string, startDate?: string, endDate?: string) {
  const dateRange = {
    gte: new Date(getStartDate(timeRange, startDate)),
    lte: new Date(getEndDate(endDate)),
  };

  // Get overall platform statistics
  const totalUsers = await prisma.user.count({
    where: { createdAt: dateRange },
  });

  const totalQuests = await prisma.quest.count({
    where: { createdAt: dateRange },
  });

  const totalAssignments = await prisma.questAssignment.count({
    where: { assignedAt: dateRange },
  });

  const totalCompletions = await prisma.questCompletion.count({
    where: { completionDate: dateRange },
  });

  // Get active users in the time period
  const activeUsersCount = await prisma.user.count({
    where: { lastLoginAt: dateRange },
  });

  // Get top quest categories using Prisma groupBy
  const categoryGroups = await prisma.quest.groupBy({
    by: ['questCategory'],
    _count: true,
    where: { createdAt: dateRange },
    orderBy: { _count: { questCategory: 'desc' } },
    take: 10,
  });
  const topCategories = categoryGroups.map((g) => ({ category: g.questCategory, count: g._count }));

  // Get rank distribution
  const allUsers = await prisma.user.findMany({
    where: {
      role: 'adventurer',
      createdAt: dateRange,
    },
    select: { rank: true },
  });

  // Group by rank manually
  const rankDistribution = allUsers.reduce((acc: any[], user: any) => {
    const existing = acc.find(item => item.rank === user.rank);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ rank: user.rank, count: 1 });
    }
    return acc;
  }, []);

  return Response.json({
    platformStats: {
      totalUsers: totalUsers || 0,
      totalQuests: totalQuests || 0,
      totalAssignments: totalAssignments || 0,
      totalCompletions: totalCompletions || 0,
      activeUsers: activeUsersCount,
      completionRate: totalAssignments ? (totalCompletions || 0) / totalAssignments * 100 : 0,
    },
    topCategories,
    rankDistribution,
    success: true,
  });
}

// Helper function to get start date based on time range
function getStartDate(timeRange: string, startDate?: string): string {
  if (startDate) {
    return startDate;
  }

  const now = new Date();
  let start = new Date(now);

  switch (timeRange) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Default to 30 days
      start.setDate(now.getDate() - 30);
  }

  return start.toISOString();
}

// Helper function to get end date
function getEndDate(endDate?: string): string {
  return endDate ? endDate : new Date().toISOString();
}

// Function to calculate progress over time
async function getProgressData(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get daily XP gains over the period
  const data = await prisma.questCompletion.findMany({
    where: {
      userId,
      completionDate: {
        gte: new Date(getStartDate(timeRange, startDate)),
        lte: new Date(getEndDate(endDate)),
      },
    },
    select: {
      completionDate: true,
      xpEarned: true,
      skillPointsEarned: true,
    },
    orderBy: { completionDate: 'asc' },
  });

  // Group by date and sum up XP/Skill Points
  const progressByDate: Record<string, { xp: number; sp: number }> = {};
  data.forEach(item => {
    if (!item.completionDate) return;
    const date = item.completionDate.toISOString().split('T')[0]; // Get just the date part
    if (!progressByDate[date]) {
      progressByDate[date] = { xp: 0, sp: 0 };
    }
    progressByDate[date].xp += item.xpEarned || 0;
    progressByDate[date].sp += item.skillPointsEarned || 0;
  });

  // Convert to array format for charting
  return Object.entries(progressByDate)
    .map(([date, values]) => ({
      date,
      xp: values.xp,
      sp: values.sp,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
