// lib/xp-utils.ts
// Replaces Supabase RPC: update_user_xp_and_skills
import { prisma } from './db';
import { getRankForXp, XP_PER_LEVEL } from './ranks';
import { UserRank } from '@prisma/client';
import { logActivity } from './activity-logger';
import { syncAdventurerStreak } from './streak-utils';
import { checkAchievements } from './achievement-checker';

export function calculateLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export async function updateUserXpAndSkills(
  userId: string,
  xpGained: number,
  skillPointsGained: number,
  options?: { questId?: string }
): Promise<{
  newXp: number;
  newLevel: number;
  newRank: string;
  rankChanged: boolean;
  appliedMultiplier: number;
  adjustedXpGained: number;
  currentStreak: number;
}> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, rank: true },
    });

    if (!user) throw new Error('User not found');

    const streakSummary = await syncAdventurerStreak(tx, userId);
    const adjustedXpGained = Math.round(xpGained * streakSummary.multiplier);
    const newXp = user.xp + adjustedXpGained;
    const newRank = getRankForXp(newXp) as UserRank;
    const rankChanged = user.rank !== newRank;

    // Update user XP, level, rank, skill points
    await tx.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        rank: newRank,
        skillPoints: { increment: skillPointsGained },
      },
    });

    if (options?.questId) {
      await tx.questCompletion.updateMany({
        where: {
          questId: options.questId,
          userId,
        },
        data: {
          xpEarned: adjustedXpGained,
        },
      });
    }

    // Update adventurer profile stats
    const totalAssignments = await tx.questAssignment.count({
      where: { userId },
    });

    const completedAssignments = await tx.questAssignment.count({
      where: { userId, status: 'completed' },
    });

    const completionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 10000) / 100
      : 0;

    await tx.adventurerProfile.update({
      where: { userId },
      data: {
        totalQuestsCompleted: { increment: 1 },
        questCompletionRate: completionRate,
      },
    });

    // Log quest completion activity
    if (options?.questId) {
      await logActivity(userId, 'quest_complete', { questId: options.questId, xp: xpGained }, tx);
    }

    // Check for quest completion achievements
    await checkAchievements(userId, 'quest_complete');

    // Send rank-up notification if rank changed
    if (rankChanged) {
      await tx.notification.create({
        data: {
          userId,
          title: 'Rank Up!',
          message: `Congratulations! You've been promoted to ${newRank}-Rank!`,
          type: 'rank_up',
          data: { newRank, previousRank: user.rank },
        },
      });

      // Log rank up activity
      await logActivity(userId, 'rank_up', { fromRank: user.rank, toRank: newRank }, tx);

      // Check for rank-up achievements
      await checkAchievements(userId, 'rank_up', { newRank });
    }

    return {
      newXp,
      newLevel,
      newRank,
      rankChanged,
      appliedMultiplier: streakSummary.multiplier,
      adjustedXpGained,
      currentStreak: streakSummary.currentStreak,
    };
  });
}

/**
 * Update company spending after a payment.
 * Replaces supabase.rpc('update_company_spending').
 */
export async function updateCompanySpending(companyUserId: string, amount: number): Promise<void> {
  await prisma.companyProfile.update({
    where: { userId: companyUserId },
    data: {
      totalSpent: { increment: amount },
    },
  });
}
