import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await prisma.adventurerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        currentStreak: true,
        streakMultiplier: true,
        specialization: true,
        totalQuestsCompleted: true,
        questCompletionRate: true,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching adventurer profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
