// app/api/admin/quests/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const where: Prisma.QuestWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (questType) {
      where.questType = questType;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.quest.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        questType: true,
        status: true,
        difficulty: true,
        xpReward: true,
        skillPointsReward: true,
        monetaryReward: true,
        requiredSkills: true,
        requiredRank: true,
        maxParticipants: true,
        questCategory: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        deadline: true,
        company: {
          select: {
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ quests: data, success: true });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return Response.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId, status, requiredRank, maxParticipants } = body;

    // Validate required fields
    if (!questId) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Update the quest
    const updateData: Prisma.QuestUpdateInput = {};
    if (status !== undefined) updateData.status = status;
    if (requiredRank !== undefined) updateData.requiredRank = requiredRank;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;

    const data = await prisma.quest.update({
      where: { id: questId },
      data: updateData,
    });

    return Response.json({ quest: data, success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    return Response.json({ error: 'Failed to update quest', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;

    // Validate required field
    if (!questId) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Delete the quest (in reality, you'd want to archive rather than hard delete)
    await prisma.quest.update({
      where: { id: questId },
      data: { status: 'cancelled' },
    });

    return Response.json({ message: 'Quest cancelled successfully', success: true });
  } catch (error) {
    console.error('Error cancelling quest:', error);
    return Response.json({ error: 'Failed to cancel quest', success: false }, { status: 500 });
  }
}
