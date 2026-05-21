/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma, withDbRetry } from '@/lib/db';
import { QuestStatus, QuestCategory, UserRank, QuestTrack } from '@prisma/client';

interface PublicQuestFilters {
  category?: string;
  difficulty?: string;
  track?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getPublicQuests(filters: PublicQuestFilters = {}) {
  const { category, difficulty, track, search, page = 1, limit = 12 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: QuestStatus.available,
  };

  // Track filter (default to OPEN for public visitors)
  if (track && Object.values(QuestTrack).includes(track as QuestTrack)) {
    where.track = track as QuestTrack;
  } else {
    where.track = QuestTrack.OPEN;
  }

  // Category filter
  if (category && Object.values(QuestCategory).includes(category as QuestCategory)) {
    where.questCategory = category as QuestCategory;
  }

  // Difficulty filter
  if (difficulty && Object.values(UserRank).includes(difficulty as UserRank)) {
    where.difficulty = difficulty as UserRank;
  }

  // Search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  const [quests, totalCount] = await withDbRetry(() =>
    Promise.all([
      prisma.quest.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              companyProfile: {
                select: { companyName: true },
              },
            },
          },
          _count: {
            select: { assignments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quest.count({ where }),
    ])
  );

  return {
    quests: quests.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      company: q.company?.companyProfile?.companyName || q.company?.name || 'Unknown Company',
      difficulty: q.difficulty,
      track: q.track,
      xpReward: q.xpReward,
      monetaryReward: q.monetaryReward ? Number(q.monetaryReward) : null,
      deadline: q.deadline ? q.deadline.toISOString() : null,
      requiredSkills: q.requiredSkills || [],
      applicants: q._count.assignments,
      questCategory: q.questCategory,
      maxParticipants: q.maxParticipants,
      createdAt: q.createdAt.toISOString(),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getQuestCategories() {
  return Object.values(QuestCategory);
}

export async function getQuestDifficulties() {
  return Object.values(UserRank);
}