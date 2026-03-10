// app/api/admin/quests/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma, QuestStatus, QuestType, UserRank } from '@prisma/client';

interface AdminNote {
  [key: string]: string; // satisfies Prisma InputJsonObject index signature
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    const where: Prisma.QuestWhereInput = {};

    if (status) {
      where.status = status as QuestStatus;
    }
    if (questType) {
      where.questType = questType as QuestType;
    }
    if (difficulty) {
      where.difficulty = difficulty as UserRank;
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
        adminNotes: true,
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
        _count: {
          select: { assignments: true },
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    const requiredFields = ['title', 'description', 'questType', 'difficulty', 'xpReward', 'questCategory'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    const data = await prisma.quest.create({
      data: {
        title: body.title,
        description: body.description,
        detailedDescription: body.detailedDescription || null,
        questType: body.questType,
        difficulty: body.difficulty,
        xpReward: body.xpReward,
        skillPointsReward: body.skillPointsReward || 0,
        monetaryReward: body.monetaryReward || null,
        requiredSkills: body.requiredSkills || [],
        requiredRank: body.requiredRank || null,
        maxParticipants: body.maxParticipants || null,
        questCategory: body.questCategory,
        status: body.status || 'available',
        companyId: null,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    return Response.json({ quest: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return Response.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId, addNote, ...updateFields } = body;

    if (!questId) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    const updateData: Prisma.QuestUpdateInput = {};

    // Handle observation note addition
    if (addNote && typeof addNote === 'string' && addNote.trim()) {
      const quest = await prisma.quest.findUnique({
        where: { id: questId },
        select: { adminNotes: true },
      });
      const existing = (quest?.adminNotes as AdminNote[] | null) || [];
      const newNote: AdminNote = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        author: user.name ?? user.email ?? 'Admin',
        note: addNote.trim(),
      };
      updateData.adminNotes = [...existing, newNote];
    }

    // Handle standard field updates
    const validStatuses = Object.values(QuestStatus);
    if (updateFields.status !== undefined) {
      if (!validStatuses.includes(updateFields.status as QuestStatus)) {
        return Response.json({ error: 'Invalid status value', success: false }, { status: 400 });
      }
      updateData.status = updateFields.status as QuestStatus;
    }
    if (updateFields.title !== undefined) updateData.title = updateFields.title;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;
    if (updateFields.requiredRank !== undefined) updateData.requiredRank = updateFields.requiredRank;
    if (updateFields.maxParticipants !== undefined) updateData.maxParticipants = updateFields.maxParticipants;
    if (updateFields.xpReward !== undefined) updateData.xpReward = updateFields.xpReward;
    if (updateFields.deadline !== undefined) {
      updateData.deadline = updateFields.deadline ? new Date(updateFields.deadline) : null;
    }

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
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;

    if (!questId) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

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
