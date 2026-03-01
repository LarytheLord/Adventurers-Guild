// lib/rank-utils.ts
import { prisma } from './db';

// Types
export interface RankingUser {
  id: string;
  name: string;
  email: string;
  rank: string;
  xp: number;
  skillPoints: number;
  level: number;
  position: number;
  adventurerProfile?: {
    specialization?: string;
    questCompletionRate?: number;
    totalQuestsCompleted?: number;
  };
}

export interface RankingsParams {
  sort?: 'xp' | 'level' | 'skillPoints';
  order?: 'asc' | 'desc';
  limit?: string;
  rank?: string;
}

// Fetch rankings
export async function fetchRankings(params: RankingsParams = {}): Promise<RankingUser[]> {
  const { sort = 'xp', order = 'desc', limit = '20', rank } = params;

  const where: any = { role: 'adventurer', isActive: true };
  if (rank) where.rank = rank;

  const users = await prisma.user.findMany({
    where,
    include: {
      adventurerProfile: {
        select: {
          specialization: true,
          questCompletionRate: true,
          totalQuestsCompleted: true,
        },
      },
    },
    orderBy: { [sort]: order },
    take: parseInt(limit),
  });

  return users.map((user, index) => ({
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    rank: user.rank,
    xp: user.xp,
    skillPoints: user.skillPoints,
    level: user.level,
    position: index + 1,
    adventurerProfile: user.adventurerProfile
      ? {
          specialization: user.adventurerProfile.specialization ?? undefined,
          questCompletionRate: Number(user.adventurerProfile.questCompletionRate),
          totalQuestsCompleted: user.adventurerProfile.totalQuestsCompleted,
        }
      : undefined,
  }));
}

// Calculate user's current rank position
export async function getUserRank(userId: string): Promise<{ position: number; totalUsers: number } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    if (!user) return null;

    const totalUsers = await prisma.user.count({
      where: { role: 'adventurer', isActive: true },
    });

    const position = await prisma.user.count({
      where: { role: 'adventurer', isActive: true, xp: { gt: user.xp } },
    });

    return { position: position + 1, totalUsers };
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return null;
  }
}

// Re-export centralized rank utilities
export { getRankForXp as getNextRankFn, getNextRankThreshold, getRankProgressPercent } from './ranks';
import { getNextRankThreshold, getRankProgressPercent } from './ranks';

// Calculate the next rank based on current XP
export function getNextRank(currentXp: number): { rank: string; nextRankXp: number } {
  const { currentRank, nextRankXp } = getNextRankThreshold(currentXp);
  return { rank: currentRank, nextRankXp };
}

// Calculate XP needed for next rank
export function getXpToNextRank(currentXp: number): number {
  const { nextRankXp } = getNextRankThreshold(currentXp);
  return nextRankXp > 0 ? nextRankXp - currentXp : 0;
}

// Calculate rank progress percentage
export function getRankProgress(currentXp: number): number {
  return getRankProgressPercent(currentXp);
}
