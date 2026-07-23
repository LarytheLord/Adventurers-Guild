// lib/xp-utils.ts
// Replaces Supabase RPC: update_user_xp_and_skills
import { prisma } from './db';
import { getRankForXp } from './ranks';
import { UserRank, Prisma } from '@prisma/client';
import { logActivity } from './activity-logger';
import { updateStreak } from './streak-utils';
import { checkAchievements } from './achievement-checker';
import { recalculateGuildScore } from './guild-score';

/**
 * Calculate level from total XP.
 * Level = floor(XP / 100) + 1
 */
export function calculateLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Update user XP, level, rank, and skill points in a single transaction.
 * Also updates adventurer_profiles stats (questsCompleted, completionRate).
 * 
 * @param userId The user ID to update
 * @param xpGained XP amount to add
 * @param skillPointsGained Skill points to add
 * @param questId Optional quest ID for activity logging
 * @param tx Optional Prisma transaction client - if provided, uses existing transaction
 */
export async function updateUserXpAndSkills(
  userId: string,
  xpGained: number,
  skillPointsGained: number,
  questId?: string,
  tx?: Prisma.TransactionClient
): Promise<{ newXp: number; newLevel: number; newRank: string; rankChanged: boolean }> {
  // If transaction client is provided, use it directly
  if (tx) {
    return updateUserXpAndSkillsTransaction(userId, xpGained, skillPointsGained, questId, tx);
  }
  
  // Otherwise create a new transaction
  return prisma.$transaction(async (transaction) => {
    return updateUserXpAndSkillsTransaction(userId, xpGained, skillPointsGained, questId, transaction);
  });
}

/**
 * Internal helper function that performs the actual update logic.
 * This can be called from within an existing transaction.
 */
async function updateUserXpAndSkillsTransaction(
  userId: string,
  xpGained: number,
  skillPointsGained: number,
  questId: string | undefined,
  tx: Prisma.TransactionClient
): Promise<{ newXp: number; newLevel: number; newRank: string; rankChanged: boolean }> {
    // Get current user stats
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, rank: true },
    });

    if (!user) throw new Error('User not found');

    const profile = await tx.adventurerProfile.findUnique({
      where: { userId },
      select: { streakMultiplier: true },
    });

    const multiplier = profile?.streakMultiplier ?? 1.0;
    const newXp = user.xp + Math.round(xpGained * Number(multiplier));
    const newLevel = calculateLevelFromXP(newXp);
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

    await recalculateGuildScore(userId, tx);

    await updateStreak(userId, tx);

    // Log quest completion activity
    if (questId) {
      await logActivity(userId, 'quest_complete', { questId, xp: xpGained }, tx);
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

    return { newXp, newLevel, newRank, rankChanged };
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
