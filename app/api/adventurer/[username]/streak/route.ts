import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MILESTONES = [
  { days: 3,  multiplier: 1.1  },
  { days: 7,  multiplier: 1.25 },
  { days: 14, multiplier: 1.5  },
  { days: 30, multiplier: 2.0  },
];

function getNextMilestone(currentStreak: number) {
  return MILESTONES.find((m) => m.days > currentStreak) ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'adventurer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const profile = await prisma.adventurerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        currentStreak:   true,
        longestStreak:   true,
        streakMultiplier: true,
        lastActiveDate:  true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      multiplier:    Number(profile.streakMultiplier),
      lastActiveDate: profile.lastActiveDate
        ? profile.lastActiveDate.toISOString().split('T')[0]
        : null,
      nextMilestone: getNextMilestone(profile.currentStreak),
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}