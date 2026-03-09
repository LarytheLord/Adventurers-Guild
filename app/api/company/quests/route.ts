// app/api/company/quests/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    // Use authenticated user's ID as company_id (override any query param to prevent spoofing)
    const companyId = authUser.role === 'admin' ? (searchParams.get('company_id') || authUser.id) : authUser.id;
    const status = searchParams.get('status');
    const questType = searchParams.get('questType');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const where: Record<string, unknown> = {
      companyId,
    };

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
    // Force company_id to authenticated user
    const companyId = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

    // Validate required fields
    const requiredFields = ['title', 'description', 'questType', 'difficulty', 'xpReward', 'questCategory'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
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
        companyId,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    // Increment questsPosted counter on company profile
    await prisma.companyProfile.update({
      where: { userId: companyId },
      data: { questsPosted: { increment: 1 } },
    });

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
    const companyId = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

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
    const companyId = authUser.role === 'admin' ? (body.company_id || authUser.id) : authUser.id;

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
