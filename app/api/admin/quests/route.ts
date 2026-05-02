// app/api/admin/quests/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma, QuestStatus, QuestType, UserRank, QuestCategory, QuestTrack, QuestSource } from '@prisma/client';
import { clampPaginationValue, sanitizeSearchTerm } from '@/lib/validation/schemas';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const track = searchParams.get('track');
    const source = searchParams.get('source');
    const search = sanitizeSearchTerm(searchParams.get('search'));
    const take = clampPaginationValue(searchParams.get('limit'), { fallback: 50, min: 1, max: 200 });
    const offset = clampPaginationValue(searchParams.get('offset'), { fallback: 0, min: 0, max: 10_000 });

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
    if (track) {
      where.track = track as QuestTrack;
    }
    if (source) {
      where.source = source as QuestSource;
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
        track: true,
        source: true,
        parentQuestId: true,
        revisionCount: true,
        maxRevisions: true,
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
      skip: offset,
      take,
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
      if (body[field] == null || String(body[field]).trim() === '') {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    if (!Object.values(QuestType).includes(body.questType as QuestType)) {
      return Response.json({ error: 'Invalid questType value', success: false }, { status: 400 });
    }
    if (!Object.values(UserRank).includes(body.difficulty as UserRank)) {
      return Response.json({ error: 'Invalid difficulty value', success: false }, { status: 400 });
    }
    if (!Object.values(QuestCategory).includes(body.questCategory as QuestCategory)) {
      return Response.json({ error: 'Invalid questCategory value', success: false }, { status: 400 });
    }
    if (body.track && !Object.values(QuestTrack).includes(body.track as QuestTrack)) {
      return Response.json({ error: 'Invalid track value', success: false }, { status: 400 });
    }
    if (body.source && !Object.values(QuestSource).includes(body.source as QuestSource)) {
      return Response.json({ error: 'Invalid source value', success: false }, { status: 400 });
    }
    if (!Number.isFinite(Number(body.xpReward)) || Number(body.xpReward) <= 0 || Number(body.xpReward) > 100_000) {
      return Response.json({ error: 'xpReward must be between 1 and 100000', success: false }, { status: 400 });
    }
    if (!Number.isFinite(Number(body.skillPointsReward ?? 0)) || Number(body.skillPointsReward ?? 0) < 0 || Number(body.skillPointsReward ?? 0) > 10_000) {
      return Response.json({ error: 'skillPointsReward must be between 0 and 10000', success: false }, { status: 400 });
    }
    if (!Number.isFinite(Number(body.maxParticipants ?? 1)) || Number(body.maxParticipants ?? 1) < 1 || Number(body.maxParticipants ?? 1) > 100) {
      return Response.json({ error: 'maxParticipants must be between 1 and 100', success: false }, { status: 400 });
    }
    if (typeof body.title === 'string' && body.title.trim().length > 160) {
      return Response.json({ error: 'title must be 160 characters or fewer', success: false }, { status: 400 });
    }
    if (typeof body.description === 'string' && body.description.trim().length > 2000) {
      return Response.json({ error: 'description must be 2000 characters or fewer', success: false }, { status: 400 });
    }

    const data = await prisma.quest.create({
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        detailedDescription: typeof body.detailedDescription === 'string' ? body.detailedDescription.trim() || null : null,
        questType: body.questType as QuestType,
        difficulty: body.difficulty as UserRank,
        xpReward: Number(body.xpReward),
        skillPointsReward: Number(body.skillPointsReward ?? 0),
        monetaryReward: body.monetaryReward != null && body.monetaryReward !== '' ? Number(body.monetaryReward) : null,
        requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills.filter((skill: any): skill is string => typeof skill === 'string').map((skill: string) => skill.trim()).filter(Boolean).slice(0, 20) : [],
        requiredRank: body.requiredRank || null,
        maxParticipants: Number(body.maxParticipants ?? 1),
        questCategory: body.questCategory as QuestCategory,
        track: (body.track as QuestTrack) || undefined,
        source: (body.source as QuestSource) || undefined,
        parentQuestId: body.parentQuestId || null,
        partnerOrgName: typeof body.partnerOrgName === 'string' ? body.partnerOrgName.trim().slice(0, 120) || null : null,
        hackathonEventId: typeof body.hackathonEventId === 'string' ? body.hackathonEventId.trim().slice(0, 120) || null : null,
        status: body.status || 'available',
        companyId: body.companyId || null,
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
    if (!UUID_REGEX.test(questId)) {
      return Response.json({ error: 'Invalid quest ID format', success: false }, { status: 400 });
    }

    const updateData: Prisma.QuestUpdateInput = {};

    // Handle observation note addition
    if (addNote && typeof addNote === 'string' && addNote.trim()) {
      const trimmedNote = addNote.trim().slice(0, 2_000);
      const quest = await prisma.quest.findUnique({
        where: { id: questId },
        select: { adminNotes: true },
      });
      const existing = (quest?.adminNotes as AdminNote[] | null) || [];
      const newNote: AdminNote = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        author: user.name ?? user.email ?? 'Admin',
        note: trimmedNote,
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
    if (updateFields.title !== undefined) {
      const trimmedTitle = String(updateFields.title).trim();
      if (!trimmedTitle || trimmedTitle.length > 160) {
        return Response.json({ error: 'title must be between 1 and 160 characters', success: false }, { status: 400 });
      }
      updateData.title = trimmedTitle;
    }
    if (updateFields.description !== undefined) {
      const trimmedDescription = String(updateFields.description).trim();
      if (!trimmedDescription || trimmedDescription.length > 2000) {
        return Response.json({ error: 'description must be between 1 and 2000 characters', success: false }, { status: 400 });
      }
      updateData.description = trimmedDescription;
    }
    if (updateFields.requiredRank !== undefined) {
      if (updateFields.requiredRank !== null && !Object.values(UserRank).includes(updateFields.requiredRank as UserRank)) {
        return Response.json({ error: 'Invalid requiredRank value', success: false }, { status: 400 });
      }
      updateData.requiredRank = updateFields.requiredRank as UserRank | null;
    }
    if (updateFields.maxParticipants !== undefined) updateData.maxParticipants = updateFields.maxParticipants;
    if (updateFields.xpReward !== undefined) updateData.xpReward = updateFields.xpReward;
    if (updateFields.track !== undefined) {
      if (!Object.values(QuestTrack).includes(updateFields.track as QuestTrack)) {
        return Response.json({ error: 'Invalid track value', success: false }, { status: 400 });
      }
      updateData.track = updateFields.track as QuestTrack;
    }
    if (updateFields.source !== undefined) {
      if (!Object.values(QuestSource).includes(updateFields.source as QuestSource)) {
        return Response.json({ error: 'Invalid source value', success: false }, { status: 400 });
      }
      updateData.source = updateFields.source as QuestSource;
    }
    if (updateFields.parentQuestId !== undefined) {
      updateData.parentQuest = updateFields.parentQuestId
        ? { connect: { id: updateFields.parentQuestId } }
        : { disconnect: true };
    }
    if (updateFields.partnerOrgName !== undefined) updateData.partnerOrgName = updateFields.partnerOrgName;
    if (updateFields.hackathonEventId !== undefined) updateData.hackathonEventId = updateFields.hackathonEventId;
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
    if (!UUID_REGEX.test(questId)) {
      return Response.json({ error: 'Invalid quest ID format', success: false }, { status: 400 });
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
