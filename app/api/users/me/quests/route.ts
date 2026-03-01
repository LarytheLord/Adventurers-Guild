import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const assignments = await prisma.questAssignment.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            xpReward: true,
            skillPointsReward: true,
            monetaryReward: true,
            questCategory: true,
            deadline: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: limit,
    });

    // Transform data to match previous response shape
    const quests = assignments.map((item) => ({
      id: item.id,
      questId: item.questId,
      userId: item.userId,
      status: item.status,
      assignedAt: item.assignedAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      progress: item.progress,
      quests: item.quest,
    }));

    return NextResponse.json({
      quests,
      success: true
    });
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}
