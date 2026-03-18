import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { QuestTrack, UserRank } from '@prisma/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RANK_ORDER: Record<UserRank, number> = {
  F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6,
};

// POST /api/parties — form a party for a quest
export async function POST(request: NextRequest) {
  const user = await requireAuth(request, 'adventurer', 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const { id: userId, role, rank } = user;

  let body: { questId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', success: false }, { status: 400 });
  }

  const { questId } = body;
  if (!questId || !UUID_REGEX.test(questId)) {
    return NextResponse.json({ error: 'questId is required and must be a valid UUID', success: false }, { status: 400 });
  }

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    select: { id: true, status: true, track: true, difficulty: true, party: { select: { id: true } } },
  });

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
  }
  if (!['available', 'in_progress'].includes(quest.status)) {
    return NextResponse.json({ error: 'Quest is not available for a party', success: false }, { status: 400 });
  }
  if (quest.party) {
    return NextResponse.json({ error: 'A party already exists for this quest', success: false }, { status: 409 });
  }

  // Rank check (skip for admin)
  if (role !== 'admin' && rank) {
    if (RANK_ORDER[rank as UserRank] < RANK_ORDER[quest.difficulty]) {
      return NextResponse.json(
        { error: `Quest requires rank ${quest.difficulty} or higher to lead`, success: false },
        { status: 403 }
      );
    }

    // Bootcamp quest: leader must have a BootcampLink
    if (quest.track === QuestTrack.BOOTCAMP) {
      const link = await prisma.bootcampLink.findUnique({ where: { userId }, select: { id: true } });
      if (!link) {
        return NextResponse.json({ error: 'Bootcamp track quests require a bootcamp enrollment', success: false }, { status: 403 });
      }
    }
  }

  const maxSize = quest.track === QuestTrack.BOOTCAMP ? 2 : 5;

  const party = await prisma.$transaction(async (tx) => {
    const created = await tx.party.create({
      data: { questId, leaderId: userId, track: quest.track, maxSize },
    });
    await tx.partyMember.create({
      data: { partyId: created.id, userId, isLeader: true },
    });
    return tx.party.findUnique({
      where: { id: created.id },
      include: {
        leader: { select: { id: true, name: true, rank: true } },
        members: {
          include: { user: { select: { id: true, name: true, rank: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  });

  return NextResponse.json({ party, success: true }, { status: 201 });
}
