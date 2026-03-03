import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type RankingsMode = 'adventurer' | 'company';
type SortOrder = 'asc' | 'desc';
type AdventurerSort = 'xp' | 'level' | 'skillPoints';
type CompanySort = 'totalSpent' | 'questsPosted' | 'completedQuests' | 'activeQuests';

function parseMode(rawMode: string | null): RankingsMode | null {
  if (rawMode === 'adventurer' || rawMode === 'company') return rawMode;
  return null;
}

function parseOrder(rawOrder: string | null): SortOrder {
  return rawOrder === 'asc' ? 'asc' : 'desc';
}

function parseAdventurerSort(rawSort: string | null): AdventurerSort {
  if (rawSort === 'level' || rawSort === 'skillPoints') return rawSort;
  return 'xp';
}

function parseCompanySort(rawSort: string | null): CompanySort {
  if (
    rawSort === 'questsPosted' ||
    rawSort === 'completedQuests' ||
    rawSort === 'activeQuests'
  ) {
    return rawSort;
  }
  return 'totalSpent';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const requestedUserId = searchParams.get('userId');
    const userId = requestedUserId || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        xp: true,
        level: true,
        skillPoints: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const requestedMode = parseMode(searchParams.get('mode'));
    const mode: RankingsMode =
      requestedMode || (user.role === 'company' ? 'company' : 'adventurer');
    const order = parseOrder(searchParams.get('order'));

    if (mode === 'company') {
      const sort = parseCompanySort(searchParams.get('sort'));
      const companies = await prisma.user.findMany({
        where: { role: 'company' },
        select: {
          id: true,
          createdAt: true,
          companyProfile: {
            select: {
              totalSpent: true,
              questsPosted: true,
            },
          },
          quests: {
            select: { status: true },
          },
        },
      });

      const ranked = companies
        .map((company) => {
          const totalSpent = Number(company.companyProfile?.totalSpent ?? 0);
          const questsPosted = company.companyProfile?.questsPosted ?? company.quests.length;
          const completedQuests = company.quests.filter((quest) => quest.status === 'completed').length;
          const activeQuests = company.quests.filter((quest) =>
            ['available', 'in_progress', 'review'].includes(quest.status)
          ).length;

          return {
            id: company.id,
            totalSpent,
            questsPosted,
            completedQuests,
            activeQuests,
            createdAt: company.createdAt,
          };
        })
        .sort((a, b) => {
          const direction = order === 'asc' ? 1 : -1;
          const delta = (a[sort] - b[sort]) * direction;
          if (delta !== 0) return delta;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

      const position = ranked.findIndex((entry) => entry.id === userId) + 1;
      if (position === 0) {
        return NextResponse.json(
          { success: false, error: 'User is not ranked in company mode' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        rank: {
          mode,
          sort,
          order,
          position,
          totalUsers: ranked.length,
        },
      });
    }

    const sort = parseAdventurerSort(searchParams.get('sort'));
    const comparator = order === 'asc' ? 'lt' : 'gt';
    const scoreValue = user[sort];

    const totalUsers = await prisma.user.count({
      where: { role: 'adventurer' },
    });

    const betterUsersCount = await prisma.user.count({
      where: {
        role: 'adventurer',
        [sort]: { [comparator]: scoreValue },
      },
    });

    return NextResponse.json({
      success: true,
      rank: {
        mode,
        sort,
        order,
        position: betterUsersCount + 1,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user ranking' },
      { status: 500 }
    );
  }
}
