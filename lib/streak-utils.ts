import { Prisma } from '@prisma/client';

function getUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function calculateMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

export async function updateStreak(userId: string, tx: Prisma.TransactionClient): Promise<void> {
  const profile = await tx.adventurerProfile.findUnique({
    where: { userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      maxStreak: true,
      lastStreakDate: true,
    },
  });

  if (!profile) return;

  const todayUtc = getUtcDay(new Date());
  const lastStreakUtc = profile.lastStreakDate ? getUtcDay(new Date(profile.lastStreakDate)) : null;

  const diffDays = lastStreakUtc
    ? Math.floor((todayUtc.getTime() - lastStreakUtc.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let newStreak = profile.currentStreak;

  if (diffDays === null || diffDays > 1) {
    newStreak = 1;
  } else if (diffDays === 1) {
    newStreak = profile.currentStreak + 1;
  }

  const newMaxStreak = Math.max(profile.maxStreak, newStreak);
  const newLongestStreak = Math.max(profile.longestStreak, newStreak);
  const newMultiplier = calculateMultiplier(newStreak);

  await tx.adventurerProfile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      longestStreak: newLongestStreak,
      lastStreakDate: todayUtc,
      lastActiveDate: todayUtc,
      streakMultiplier: newMultiplier,
    },
  });
}
