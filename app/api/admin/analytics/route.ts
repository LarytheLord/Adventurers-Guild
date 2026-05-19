import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Range = '7d' | '30d' | '90d';

function getDateRange(range: Range): Date {
  const now = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range];
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') as Range) || '30d';
    const rangeStart = getDateRange(range);

    const [
      totalUsers,
      totalAdventurers,
      totalCompanies,
      totalQuests,
      completedQuests,
      totalRevenue,
      recentUsers,
      recentCompletions,
      rankDistribution,
      usersOverTime,
      questsOverTime,
      pendingSubmissions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'adventurer' } }),
      prisma.user.count({ where: { role: 'company' } }),
      prisma.quest.count(),
      prisma.questAssignment.count({ where: { status: 'completed' } }),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.user.count({ where: { createdAt: { gte: rangeStart } } }),
      prisma.questAssignment.count({
        where: { status: 'completed', completedAt: { gte: rangeStart } },
      }),
      prisma.user.groupBy({
        by: ['rank'],
        _count: true,
      }),
      getUsersOverTime(rangeStart),
      getQuestsOverTime(rangeStart),
      prisma.questAssignment.count({
        where: { status: { in: ['submitted', 'review'] } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalAdventurers,
          totalCompanies,
          totalQuests,
          completedQuests,
          totalRevenue: totalRevenue._sum.amount ?? 0,
          recentUsers,
          recentCompletions,
          pendingSubmissions,
        },
        rankDistribution: rankDistribution.map((entry) => ({ rank: entry.rank, count: entry._count })),
        usersOverTime,
        questsOverTime,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

async function getUsersOverTime(since: Date) {
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return aggregateByDate(users.map((u) => u.createdAt));
}

async function getQuestsOverTime(since: Date) {
  const completions = await prisma.questAssignment.findMany({
    where: { status: 'completed', completedAt: { gte: since } },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  return aggregateByDate(completions.map((c) => c.completedAt));
}

function aggregateByDate(dates: (Date | null)[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const date of dates) {
    if (!date) continue;
    const key = date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
