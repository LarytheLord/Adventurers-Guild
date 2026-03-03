import { NextRequest, NextResponse } from 'next/server';
import { UserRank } from '@prisma/client';
import { prisma } from '@/lib/db';

type RankingsMode = 'adventurer' | 'company';
type SortOrder = 'asc' | 'desc';
type AdventurerSort = 'xp' | 'level' | 'skillPoints';
type CompanySort = 'totalSpent' | 'questsPosted' | 'completedQuests' | 'activeQuests';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function parseOrder(rawOrder: string | null): SortOrder {
  return rawOrder === 'asc' ? 'asc' : 'desc';
}

function parseMode(rawMode: string | null): RankingsMode {
  return rawMode === 'company' ? 'company' : 'adventurer';
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

function normalizeRank(rawRank: string | null): UserRank | null {
  if (!rawRank) return null;
  const rank = rawRank.toUpperCase();
  return ['F', 'E', 'D', 'C', 'B', 'A', 'S'].includes(rank) ? (rank as UserRank) : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = parseMode(searchParams.get('mode'));
    const order = parseOrder(searchParams.get('order'));
    const limit = parseLimit(searchParams.get('limit'));

    if (mode === 'company') {
      const sort = parseCompanySort(searchParams.get('sort'));
      const companies = await prisma.user.findMany({
        where: { role: 'company' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isVerified: true,
          companyProfile: {
            select: {
              companyName: true,
              industry: true,
              size: true,
              isVerified: true,
              questsPosted: true,
              totalSpent: true,
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
            name: company.name || company.companyProfile?.companyName || company.email,
            email: company.email,
            companyName: company.companyProfile?.companyName || company.name || company.email,
            industry: company.companyProfile?.industry || null,
            size: company.companyProfile?.size || null,
            isVerified: company.isVerified || company.companyProfile?.isVerified || false,
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
        })
        .slice(0, limit)
        .map((company, index) => ({
          ...company,
          position: index + 1,
        }));

      return NextResponse.json({
        success: true,
        mode,
        sort,
        order,
        total: companies.length,
        rankings: ranked,
      });
    }

    const sort = parseAdventurerSort(searchParams.get('sort'));
    const rank = normalizeRank(searchParams.get('rank'));
    const where = {
      role: 'adventurer' as const,
      ...(rank ? { rank } : {}),
    };

    const adventurers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        rank: true,
        xp: true,
        level: true,
        skillPoints: true,
        createdAt: true,
        adventurerProfile: {
          select: {
            specialization: true,
            totalQuestsCompleted: true,
            questCompletionRate: true,
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
      take: limit,
    });

    const rankings = adventurers.map((user, index) => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      rank: user.rank,
      xp: user.xp,
      level: user.level,
      skillPoints: user.skillPoints,
      position: index + 1,
      adventurerProfiles: user.adventurerProfile
        ? {
            specialization: user.adventurerProfile.specialization || undefined,
            totalQuestsCompleted: user.adventurerProfile.totalQuestsCompleted,
            questCompletionRate: Number(user.adventurerProfile.questCompletionRate),
          }
        : undefined,
      adventurer_profiles: user.adventurerProfile
        ? {
            specialization: user.adventurerProfile.specialization || undefined,
            totalQuestsCompleted: user.adventurerProfile.totalQuestsCompleted,
            questCompletionRate: Number(user.adventurerProfile.questCompletionRate),
          }
        : undefined,
    }));

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      mode,
      sort,
      order,
      rank,
      total,
      rankings,
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
