// app/api/company/quests/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { Prisma, QuestStatus, QuestType, UserRank, QuestTrack, QuestSource } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const companyId = authUser.id;
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const where: Prisma.QuestWhereInput = { companyId };

    if (status) {
      if (!Object.values(QuestStatus).includes(status as QuestStatus)) {
        return Response.json({ error: 'Invalid status value', success: false }, { status: 400 });
      }
      where.status = status as QuestStatus;
    }
    if (questType) {
      if (!Object.values(QuestType).includes(questType as QuestType)) {
        return Response.json({ error: 'Invalid questType value', success: false }, { status: 400 });
      }
      where.questType = questType as QuestType;
    }
    if (difficulty) {
      if (!Object.values(UserRank).includes(difficulty as UserRank)) {
        return Response.json({ error: 'Invalid difficulty value', success: false }, { status: 400 });
      }
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
      include: {
        company: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ quests: data, success: true });
  } catch (error) {
    console.error('Error fetching company quests:', error);
    return Response.json({ error: 'Failed to fetch company quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const companyId = authUser.id;

    // Validate required fields
    const requiredFields = ['title', 'description', 'questType', 'difficulty', 'xpReward', 'questCategory'];
    for (const field of requiredFields) {
      if (body[field] == null || String(body[field]).trim() === '') {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Validate optional enums
    if (body.track && !Object.values(QuestTrack).includes(body.track as QuestTrack)) {
      return Response.json({ error: 'Invalid track value', success: false }, { status: 400 });
    }
    if (body.source && !Object.values(QuestSource).includes(body.source as QuestSource)) {
      return Response.json({ error: 'Invalid source value', success: false }, { status: 400 });
    }

    // Create the quest
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
        track: (body.track as QuestTrack) || undefined,
        source: (body.source as QuestSource) || undefined,
        parentQuestId: body.parentQuestId || null,
        companyId,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    // Only increment questsPosted for company users — admin users have no CompanyProfile
    if (authUser.role !== 'admin') {
      await prisma.companyProfile.update({
        where: { userId: companyId },
        data: { questsPosted: { increment: 1 } },
      });
    }

    return Response.json({ quest: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return Response.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId, ...rawUpdateFields } = body;
    const updateFields: Record<string, unknown> = { ...rawUpdateFields };
    delete updateFields.company_id;
    const companyId = authUser.id;

    // Validate required fields
    if (!questId || !companyId) {
      return Response.json({ error: 'Quest ID and Company ID are required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest || quest.companyId !== companyId) {
      return Response.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Convert snake_case keys to camelCase for Prisma
    const prismaUpdateFields: Record<string, unknown> = {};
    const fieldMapping: Record<string, string> = {
      detailedDescription: 'detailedDescription',
      questType: 'questType',
      xpReward: 'xpReward',
      skillPointsReward: 'skillPointsReward',
      monetaryReward: 'monetaryReward',
      requiredSkills: 'requiredSkills',
      requiredRank: 'requiredRank',
      maxParticipants: 'maxParticipants',
      questCategory: 'questCategory',
    };

    for (const [key, value] of Object.entries(updateFields)) {
      const camelKey = fieldMapping[key] || key;
      prismaUpdateFields[camelKey] = value;
    }

    // Update the quest
    const data = await prisma.quest.update({
      where: { id: questId },
      data: prismaUpdateFields,
    });

    return Response.json({ quest: data, success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    return Response.json({ error: 'Failed to update quest', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;
    const companyId = authUser.id;

    // Validate required fields
    if (!questId || !companyId) {
      return Response.json({ error: 'Quest ID and Company ID are required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest || quest.companyId !== companyId) {
      return Response.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Update the quest status to cancelled instead of hard deleting
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
