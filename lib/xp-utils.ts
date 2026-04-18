// lib/xp-utils.ts
// Replaces Supabase RPC: update_user_xp_and_skills
import { prisma } from './db';
import { getRankForXp, XP_PER_LEVEL } from './ranks';
import { UserRank } from '@prisma/client';
import { logActivity } from './activity-logger';
import { updateStreak } from './streak-utils';

/**
 * Update user XP, level, rank, and skill points in a single transaction.
 * Also updates adventurer_profiles stats (quests completed, completion rate).
 */
export async function updateUserXpAndSkills(
  userId: string,
  xpGained: number,
  skillPointsGained: number,
  questId?: string
): Promise<{ newXp: number; newLevel: number; newRank: string; rankChanged: boolean }> {
  return prisma.$transaction(async (tx) => {
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
    const newLevel = user.level + Math.floor(xpGained / XP_PER_LEVEL);
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

    await updateStreak(userId, tx);

    // Log quest completion activity
    if (questId) {
      await logActivity(userId, 'quest_complete', { questId, xp: xpGained }, tx);
    }

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
