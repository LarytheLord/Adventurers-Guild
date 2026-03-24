import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/api-auth';
import { getAdventurerStreakSummary } from '@/lib/streak-utils';

export async function GET() {
  const authUser = await requireAuth('adventurer');

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const streak = await getAdventurerStreakSummary(authUser.id);

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    multiplier: streak.multiplier,
    lastActiveDate: streak.lastActiveDate,
    nextMilestone: streak.nextMilestone,
  });
}
