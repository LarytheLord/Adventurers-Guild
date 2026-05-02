// app/api/company/quests/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { Prisma, QuestStatus, QuestType, UserRank, QuestTrack, QuestSource } from '@prisma/client';
import {
  clampPaginationValue,
  questCreateSchema,
  questUpdateSchema,
  sanitizeSearchTerm,
} from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get('companyId') || searchParams.get('company_id');
    const companyId = authUser.role === 'admin' && requestedCompanyId ? requestedCompanyId : authUser.id;
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = sanitizeSearchTerm(searchParams.get('search'));
    const limit = clampPaginationValue(searchParams.get('limit'), { fallback: 10, min: 1, max: 100 });
    const offset = clampPaginationValue(searchParams.get('offset'), { fallback: 0, min: 0, max: 10_000 });

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
      skip: offset,
      take: limit,
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
    const parsedBody = questCreateSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Validation failed', details: parsedBody.error.flatten(), success: false },
        { status: 400 }
      );
    }
    const payload = parsedBody.data;
    const requestedCompanyId = payload.companyId ?? '';
    const companyId = authUser.role === 'admin' && requestedCompanyId ? requestedCompanyId : authUser.id;

    // Create the quest
    const data = await prisma.quest.create({
      data: {
        title: payload.title,
        description: payload.description,
        detailedDescription: payload.detailedDescription ?? null,
        questType: payload.questType,
        difficulty: payload.difficulty,
        xpReward: payload.xpReward,
        skillPointsReward: payload.skillPointsReward ?? 0,
        monetaryReward: payload.monetaryReward,
        requiredSkills: payload.requiredSkills ?? [],
        requiredRank: payload.requiredRank ?? null,
        maxParticipants: payload.maxParticipants ?? null,
        questCategory: payload.questCategory,
        track: (payload.track as QuestTrack) || undefined,
        source: (payload.source as QuestSource) || undefined,
        parentQuestId: payload.parentQuestId ?? null,
        companyId,
        deadline: payload.deadline ?? null,
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
    const parsedBody = questUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Validation failed', details: parsedBody.error.flatten(), success: false },
        { status: 400 }
      );
    }
    const { questId, ...updateFields } = parsedBody.data;

    // Verify the company owns this quest unless the current user is an admin.
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && quest.companyId !== authUser.id) {
      return Response.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Allowlist of fields that can be updated via this endpoint.
    // Protected fields (companyId, status, createdAt, etc.) are blocked.
    const UPDATABLE_FIELDS = new Set([
      'title', 'description', 'detailedDescription', 'questType', 'difficulty',
      'xpReward', 'skillPointsReward', 'monetaryReward', 'requiredSkills',
      'requiredRank', 'maxParticipants', 'questCategory', 'deadline',
      'track', 'source', 'parentQuestId',
    ]);

    const prismaUpdateFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateFields)) {
      if (UPDATABLE_FIELDS.has(key) && value !== undefined) {
        prismaUpdateFields[key] = value;
      }
    }

    if (Object.keys(prismaUpdateFields).length === 0) {
      return Response.json({ error: 'No valid quest fields were provided', success: false }, { status: 400 });
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
    // Validate required fields
    if (!questId) {
      return Response.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest unless the current user is an admin.
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && quest.companyId !== authUser.id) {
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
