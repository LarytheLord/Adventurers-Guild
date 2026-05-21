import { QuestTrack, UserRank } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { checkAchievements } from '@/lib/achievement-checker';

const PARTY_INCLUDE = {
  leader: {
    select: {
      id: true,
      name: true,
      rank: true,
      avatar: true,
    },
  },
  members: {
    orderBy: [{ isLeader: 'desc' as const }, { joinedAt: 'asc' as const }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          rank: true,
          avatar: true,
          email: true,
        },
      },
    },
  },
};

const RANK_ORDER: Record<UserRank, number> = {
  F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6,
};

export async function POST(request: NextRequest) {
  try {
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
    if (!questId) {
      return NextResponse.json({ error: 'questId is required', success: false }, { status: 400 });
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

    if (role !== 'admin' && rank) {
      if (RANK_ORDER[rank as UserRank] < RANK_ORDER[quest.difficulty]) {
        return NextResponse.json(
          { error: `Quest requires rank ${quest.difficulty} or higher to lead`, success: false },
          { status: 403 }
        );
      }

      if (quest.track === QuestTrack.BOOTCAMP) {
        const link = await prisma.bootcampLink.findUnique({ where: { userId }, select: { id: true } });
        if (!link) {
          return NextResponse.json({ error: 'Bootcamp track quests require a bootcamp enrollment', success: false }, { status: 403 });
        }
      }
    }

    const party = await prisma.$transaction(async (tx) => {
      const created = await tx.party.create({
        data: { questId, leaderId: userId, track: quest.track, maxSize: quest.track === QuestTrack.BOOTCAMP ? 2 : 5 },
      });
      await tx.partyMember.create({
        data: { partyId: created.id, userId, isLeader: true },
      });
      return tx.party.findUnique({
        where: { id: created.id },
        include: PARTY_INCLUDE,
      });
    });

    await checkAchievements(userId, 'party_create');

    return NextResponse.json({ party, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json({ error: 'Failed to create party', success: false }, { status: 500 });
  }
}