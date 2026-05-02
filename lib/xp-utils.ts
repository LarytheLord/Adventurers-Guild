// lib/xp-utils.ts
// Replaces Supabase RPC: update_user_xp_and_skills
import { prisma } from './db';
import { getRankForXp, XP_PER_LEVEL } from './ranks';
import { UserRank } from '@prisma/client';

/**
 * Update user XP, level, rank, and skill points in a single transaction.
 * Also updates adventurer_profiles stats (quests completed, completion rate).
 */
export async function updateUserXpAndSkills(
  userId: string,
  xpGained: number,
  skillPointsGained: number
): Promise<{ newXp: number; newLevel: number; newRank: string; rankChanged: boolean }> {
  return prisma.$transaction(async (tx) => {
    // Get current user stats
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true, rank: true },
    });

    if (!user) throw new Error('User not found');

    const newXp = user.xp + xpGained;
    const newLevel = Math.max(1, Math.floor(newXp / XP_PER_LEVEL) + 1);
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

    await tx.adventurerProfile.upsert({
      where: { userId },
      update: {
        totalQuestsCompleted: completedAssignments,
        questCompletionRate: completionRate,
      },
      create: {
        userId,
        primarySkills: [],
        totalQuestsCompleted: completedAssignments,
        questCompletionRate: completionRate,
      },
    });

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
