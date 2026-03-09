import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus } from '@prisma/client';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authUser.id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const assignments = await prisma.questAssignment.findMany({
      where: {
        userId,
        ...(status ? { status: status as AssignmentStatus } : {}),
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
