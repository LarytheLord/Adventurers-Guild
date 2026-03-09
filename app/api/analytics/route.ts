import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subDays, subYears } from 'date-fns';
import { getAuthUser } from '@/lib/api-auth';

interface ProgressPoint {
  date: string;
  xp: number;
  sp: number;
}

export async function GET(req: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'user';
  const userId = searchParams.get('userId') || authUser.id;
  const timeRange = searchParams.get('time_range') || '30d';

  let startDate = new Date();
  if (timeRange === '7d') startDate = subDays(startDate, 7);
  else if (timeRange === '30d') startDate = subDays(startDate, 30);
  else if (timeRange === '90d') startDate = subDays(startDate, 90);
  else if (timeRange === '1y') startDate = subYears(startDate, 1);
  else startDate = subDays(startDate, 30);

  try {
    if (type === 'user') {
      // Authorization check
      if (userId !== authUser.id && authUser.role !== 'admin' && authUser.role !== 'company') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          rank: true,
          xp: true,
          createdAt: true,
          lastLoginAt: true,
        }
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const completedAssignments = await prisma.questAssignment.findMany({
        where: {
          userId: userId,
          status: 'completed',
          completedAt: {
            gte: startDate
          }
        },
        include: {
          quest: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      });

      const allCompletedAssignmentsCount = await prisma.questAssignment.count({
        where: {
          userId: userId,
          status: 'completed'
        }
      });
      
      const totalAssignmentsCount = await prisma.questAssignment.count({
        where: {
          userId: userId
        }
      });

      const xpGained = completedAssignments.reduce((acc, curr) => acc + (curr.quest.xpReward || 0), 0);
      const skillPointsGained = completedAssignments.reduce((acc, curr) => acc + (curr.quest.skillPointsReward || 0), 0);
      
      const recentActivity = completedAssignments.slice(0, 5).map(a => ({
        id: a.id,
        questId: a.questId,
        completionDate: a.completedAt?.toISOString() ?? '',
        xpEarned: a.quest.xpReward,
        skillPointsEarned: a.quest.skillPointsReward,
        qualityScore: 0, 
        quests: {
          title: a.quest.title,
          difficulty: a.quest.difficulty,
          questCategory: a.quest.questCategory
        }
      }));

      const progressMap = new Map();
      completedAssignments.forEach(a => {
        if (a.completedAt) {
          const date = a.completedAt.toISOString().split('T')[0];
          if (!progressMap.has(date)) {
            progressMap.set(date, { date, xp: 0, sp: 0 });
          }
          const entry = progressMap.get(date);
          entry.xp += a.quest.xpReward;
          entry.sp += a.quest.skillPointsReward;
        }
      });
      const progressOverTime: ProgressPoint[] = Array.from(progressMap.values()).sort((a: ProgressPoint, b: ProgressPoint) => a.date.localeCompare(b.date));

      return NextResponse.json({
        success: true,
        user: {
          ...user,
          skillPoints: Math.floor(user.xp / 10),
          level: Math.floor(Math.sqrt(user.xp)) + 1,
          joinDate: user.createdAt.toISOString(),
          lastLogin: user.lastLoginAt?.toISOString(),
          questCompletionRate: totalAssignmentsCount > 0 ? (allCompletedAssignmentsCount / totalAssignmentsCount) * 100 : 0,
          totalQuestsCompleted: allCompletedAssignmentsCount
        },
        stats: {
          totalQuests: totalAssignmentsCount,
          completedQuests: allCompletedAssignmentsCount,
          completionRate: totalAssignmentsCount > 0 ? (allCompletedAssignmentsCount / totalAssignmentsCount) * 100 : 0,
          xpGained,
          skillPointsGained
        },
        recentActivity,
        progressOverTime
      });

    } else if (type === 'platform') {
      if (authUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      const totalUsers = await prisma.user.count();
      const totalQuests = await prisma.quest.count();
      const totalAssignments = await prisma.questAssignment.count();
      const totalCompletions = await prisma.questAssignment.count({ where: { status: 'completed' } });
      
      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: subDays(new Date(), 30)
          }
        }
      });

      const questsByCategory = await prisma.quest.groupBy({
        by: ['questCategory'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      });

      const topCategories = questsByCategory.map(q => ({
        category: q.questCategory || 'Uncategorized',
        count: q._count.id
      }));

      const usersByRank = await prisma.user.groupBy({
        by: ['rank'],
        _count: {
          id: true
        }
      });

      const rankDistribution = usersByRank.map(u => ({
        rank: u.rank || 'Unranked',
        count: u._count.id
      }));

      return NextResponse.json({
        success: true,
        platformStats: {
          totalUsers,
          totalQuests,
          totalAssignments,
          totalCompletions,
          activeUsers,
          completionRate: totalAssignments > 0 ? (totalCompletions / totalAssignments) * 100 : 0
        },
        topCategories,
        rankDistribution
      });
    } else if (type === 'company') {
      if (authUser.role !== 'company' && authUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      const companyId = (authUser.role === 'admin' && userId) ? userId : authUser.id;

      const totalQuests = await prisma.quest.count({
        where: { companyId }
      });

      const activeQuests = await prisma.quest.count({
        where: { companyId, status: 'available' }
      });

      const assignments = await prisma.questAssignment.findMany({
        where: {
          quest: {
            companyId
          }
        },
        select: {
          status: true,
          startedAt: true,
          completedAt: true
        }
      });

      const totalApplicants = assignments.length;
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      const totalCompletions = completedAssignments.length;

      let totalTime = 0;
      let countWithTime = 0;
      completedAssignments.forEach(a => {
        if (a.startedAt && a.completedAt) {
          const start = new Date(a.startedAt).getTime();
          const end = new Date(a.completedAt).getTime();
          totalTime += (end - start);
          countWithTime++;
        }
      });

      const avgCompletionTime = countWithTime > 0 
        ? Math.round((totalTime / countWithTime) / (1000 * 60 * 60 * 24) * 10) / 10 
        : 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalQuests,
          activeQuests,
          totalApplicants,
          totalCompletions,
          avgCompletionTime,
          completionRate: totalApplicants > 0 ? Math.round((totalCompletions / totalApplicants) * 100) : 0
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
