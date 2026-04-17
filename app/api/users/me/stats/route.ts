import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  void request;
  try {
    const authUser = await getAuthUser();

    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authUser.id;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, rank: true, skillPoints: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Count completed quests
    const completedCount = await prisma.questAssignment.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    // Count active quests
    const activeCount = await prisma.questAssignment.count({
      where: {
        userId,
        status: { in: ['assigned', 'started', 'in_progress', 'submitted', 'pending_admin_review', 'review', 'needs_rework'] },
      },
    });

    return NextResponse.json({
      xp: user?.xp || 0,
      level: user?.level || 1,
      rank: user?.rank || 'F',
      skillPoints: user?.skillPoints || 0,
      questsCompleted: completedCount || 0,
      activeQuests: activeCount || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
