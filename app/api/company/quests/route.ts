// app/api/company/quests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { Prisma, QuestStatus, QuestType, UserRank, QuestTrack, QuestSource, QuestCategory } from '@prisma/client';

function canManageQuest(authUser: { id: string; role: string }, questCompanyId: string | null) {
  return authUser.role === 'admin' || (!!questCompanyId && questCompanyId === authUser.id);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isOwner = authUser.role === 'company';
    const ownerCompanyId = authUser.id;
    const requestedCompanyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause — companies see only their own, admins see all (or filter by ?companyId=)
    const where: Prisma.QuestWhereInput = isOwner
      ? { companyId: ownerCompanyId }
      : requestedCompanyId
        ? { companyId: requestedCompanyId }
        : {};

    if (status) {
      if (!Object.values(QuestStatus).includes(status as QuestStatus)) {
        return NextResponse.json({ error: 'Invalid status value', success: false }, { status: 400 });
      }
      where.status = status as QuestStatus;
    }
    if (questType) {
      if (!Object.values(QuestType).includes(questType as QuestType)) {
        return NextResponse.json({ error: 'Invalid questType value', success: false }, { status: 400 });
      }
      where.questType = questType as QuestType;
    }
    if (difficulty) {
      if (!Object.values(UserRank).includes(difficulty as UserRank)) {
        return NextResponse.json({ error: 'Invalid difficulty value', success: false }, { status: 400 });
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

    return NextResponse.json({ quests: data, success: true });
  } catch (error) {
    console.error('Error fetching company quests:', error);
    return NextResponse.json({ error: 'Failed to fetch company quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const companyId = authUser.id;

    // Validate required fields
    const requiredFields = ['title', 'description', 'questType', 'difficulty', 'xpReward', 'questCategory'];
    for (const field of requiredFields) {
      if (body[field] == null || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Validate enums
    if (!Object.values(QuestCategory).includes(body.questCategory as QuestCategory)) {
      return NextResponse.json({ error: `Invalid questCategory — must be one of: ${Object.values(QuestCategory).join(', ')}`, success: false }, { status: 422 });
    }
    if (body.track && !Object.values(QuestTrack).includes(body.track as QuestTrack)) {
      return NextResponse.json({ error: 'Invalid track value', success: false }, { status: 400 });
    }
    if (body.source && !Object.values(QuestSource).includes(body.source as QuestSource)) {
      return NextResponse.json({ error: 'Invalid source value', success: false }, { status: 400 });
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
        requiredRank: body.requiredRank || 'F',
        maxParticipants: body.maxParticipants || null,
        questCategory: body.questCategory,
        track: (body.track as QuestTrack) || undefined,
        source: (body.source as QuestSource) || undefined,
        partnerOrgName: body.partnerOrgName || null,
        parentQuestId: body.parentQuestId || null,
        companyId,
        deadline: body.deadline ? new Date(body.deadline) : null,
        fieldTemplateId: body.fieldTemplateId || null,
        briefData: body.briefData ?? Prisma.JsonNull,
        acceptanceCriteria: Array.isArray(body.acceptanceCriteria) ? body.acceptanceCriteria : [],
        tasks: Array.isArray(body.tasks) ? body.tasks : [],
      },
    });

    // Only increment questsPosted for company users — admin users have no CompanyProfile
    if (authUser.role !== 'admin') {
      await prisma.companyProfile.update({
        where: { userId: companyId },
        data: { questsPosted: { increment: 1 } },
      });
    }

    return NextResponse.json({ quest: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;
    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest (admins can edit any quest)
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (!canManageQuest(authUser, quest.companyId)) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    if (body.questType && !Object.values(QuestType).includes(body.questType as QuestType)) {
      return NextResponse.json({ error: 'Invalid questType value', success: false }, { status: 400 });
    }
    if (body.difficulty && !Object.values(UserRank).includes(body.difficulty as UserRank)) {
      return NextResponse.json({ error: 'Invalid difficulty value', success: false }, { status: 400 });
    }
    if (body.track && !Object.values(QuestTrack).includes(body.track as QuestTrack)) {
      return NextResponse.json({ error: 'Invalid track value', success: false }, { status: 400 });
    }
    if (body.source && !Object.values(QuestSource).includes(body.source as QuestSource)) {
      return NextResponse.json({ error: 'Invalid source value', success: false }, { status: 400 });
    }

    const prismaUpdateFields: Prisma.QuestUpdateInput = {};

    if ('title' in body) prismaUpdateFields.title = body.title;
    if ('description' in body) prismaUpdateFields.description = body.description;
    if ('detailedDescription' in body) prismaUpdateFields.detailedDescription = body.detailedDescription;
    if ('questType' in body) prismaUpdateFields.questType = body.questType;
    if ('difficulty' in body) prismaUpdateFields.difficulty = body.difficulty;
    if ('xpReward' in body) prismaUpdateFields.xpReward = body.xpReward;
    if ('skillPointsReward' in body) prismaUpdateFields.skillPointsReward = body.skillPointsReward;
    if ('monetaryReward' in body) prismaUpdateFields.monetaryReward = body.monetaryReward;
    if ('requiredSkills' in body) prismaUpdateFields.requiredSkills = body.requiredSkills;
    if ('requiredRank' in body) prismaUpdateFields.requiredRank = body.requiredRank;
    if ('maxParticipants' in body) prismaUpdateFields.maxParticipants = body.maxParticipants;
    if ('questCategory' in body) prismaUpdateFields.questCategory = body.questCategory;
    if ('track' in body) prismaUpdateFields.track = body.track;
    if ('source' in body) prismaUpdateFields.source = body.source;
    if ('partnerOrgName' in body) prismaUpdateFields.partnerOrgName = body.partnerOrgName;
    if ('parentQuestId' in body) {
      prismaUpdateFields.parentQuest = body.parentQuestId
        ? { connect: { id: body.parentQuestId } }
        : { disconnect: true };
    }
    if ('fieldTemplateId' in body) {
      prismaUpdateFields.fieldTemplate = body.fieldTemplateId
        ? { connect: { id: body.fieldTemplateId } }
        : { disconnect: true };
    }
    if ('acceptanceCriteria' in body) {
      prismaUpdateFields.acceptanceCriteria = Array.isArray(body.acceptanceCriteria) ? body.acceptanceCriteria : [];
    }
    if ('tasks' in body) {
      prismaUpdateFields.tasks = Array.isArray(body.tasks) ? body.tasks : [];
    }
    if ('briefData' in body) {
      prismaUpdateFields.briefData = body.briefData ?? Prisma.JsonNull;
    }
    if ('deadline' in body) {
      prismaUpdateFields.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    if (Object.keys(prismaUpdateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    // Update the quest
    const data = await prisma.quest.update({
      where: { id: questId },
      data: prismaUpdateFields,
    });

    return NextResponse.json({ quest: data, success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json({ error: 'Failed to update quest', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body;
    // Validate required fields
    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required', success: false }, { status: 400 });
    }

    // Verify the company owns this quest (admins can cancel any quest)
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (!canManageQuest(authUser, quest.companyId)) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this quest', success: false }, { status: 403 });
    }

    // Update the quest status to cancelled instead of hard deleting
    await prisma.quest.update({
      where: { id: questId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'Quest cancelled successfully', success: true });
  } catch (error) {
    console.error('Error cancelling quest:', error);
    return NextResponse.json({ error: 'Failed to cancel quest', success: false }, { status: 500 });
  }
}
