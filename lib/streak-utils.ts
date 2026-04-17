import prisma from "@/lib/db";

export async function updateStreak(userId: string): Promise<void> {
  const profile = await prisma.adventurerProfile.findUnique({
  where: { userId },
  });

  if (!profile) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = profile.lastActiveDate
    ? new Date(profile.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  const diffDays = lastActive
    ? Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  let newStreak = profile.currentStreak;

  if (diffDays === null || diffDays >= 2) {
    newStreak = 1;
  } 
  else if (diffDays === 1) {
    newStreak = profile.currentStreak + 1;
  }
  const newLongest = newStreak > profile.longestStreak
    ? newStreak
    : profile.longestStreak;

    const newMultiplier = calculateMultiplier(newStreak);

  await prisma.adventurerProfile.update({
  where: { userId },
  data: {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
    streakMultiplier: newMultiplier,
    },
  });
  function calculateMultiplier(streak: number): number {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.5;
    if (streak >= 7)  return 1.25;
    if (streak >= 3)  return 1.1;
    return 1.0;
  }
}
