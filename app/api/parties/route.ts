import { QuestTrack, UserRank } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

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

const RANK_VALUES: Record<UserRank, number> = {
  F: 0,
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
};

function getPartyMaxSize(track: QuestTrack) {
  return track === 'BOOTCAMP' ? 2 : 5;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const questId = typeof body.questId === 'string' ? body.questId : '';

    if (!questId) {
      return Response.json({ error: 'questId is required', success: false }, { status: 400 });
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        status: true,
        track: true,
        difficulty: true,
        party: {
          select: { id: true },
        },
      },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (!['available', 'in_progress'].includes(quest.status)) {
      return Response.json(
        { error: 'Parties can only be formed on available or in-progress quests', success: false },
        { status: 400 }
      );
    }

    if (quest.party) {
      return Response.json({ error: 'A party already exists for this quest', success: false }, { status: 409 });
    }

    if (user.role !== 'admin') {
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          rank: true,
          bootcampLink: {
            select: { id: true },
          },
        },
      });

      if (!userProfile) {
        return Response.json({ error: 'User not found', success: false }, { status: 404 });
      }

      if (RANK_VALUES[userProfile.rank] < RANK_VALUES[quest.difficulty]) {
        return Response.json(
          { error: 'Your rank is too low to lead this quest party', success: false },
          { status: 403 }
        );
      }

      if (quest.track === 'BOOTCAMP' && !userProfile.bootcampLink) {
        return Response.json(
          { error: 'Bootcamp quests require a linked bootcamp adventurer', success: false },
          { status: 403 }
        );
      }
    }

    const party = await prisma.$transaction(async (tx) => {
      const createdParty = await tx.party.create({
        data: {
          questId,
          leaderId: user.id,
          track: quest.track,
          maxSize: getPartyMaxSize(quest.track),
        },
      });

      await tx.partyMember.create({
        data: {
          partyId: createdParty.id,
          userId: user.id,
          isLeader: true,
        },
      });

      return tx.party.findUnique({
        where: { id: createdParty.id },
        include: PARTY_INCLUDE,
      });
    });

    return Response.json({ party, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return Response.json({ error: 'Failed to create party', success: false }, { status: 500 });
  }
}
