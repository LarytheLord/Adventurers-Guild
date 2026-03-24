import { UserRank } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

const RANK_VALUES: Record<UserRank, number> = {
  F: 0,
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
};

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

async function getPartyForManage(id: string) {
  return prisma.party.findUnique({
    where: { id },
    include: {
      quest: {
        select: {
          difficulty: true,
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
    },
  });
}

function meetsRankRequirement(candidateRank: UserRank, requiredRank: UserRank) {
  return RANK_VALUES[candidateRank] >= RANK_VALUES[requiredRank];
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';

    if (!search) {
      return Response.json({ users: [], success: true });
    }

    const party = await getPartyForManage(params.id);
    if (!party) {
      return Response.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && party.leaderId !== user.id) {
      return Response.json({ error: 'Only the party leader can search for members', success: false }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'adventurer',
        isActive: true,
        id: {
          notIn: party.members.map((member) => member.userId),
        },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
        ...(party.track === 'BOOTCAMP' ? { bootcampLink: { isNot: null } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        rank: true,
        avatar: true,
        bootcampLink: {
          select: { id: true },
        },
      },
      take: 24,
      orderBy: [{ rank: 'desc' }, { createdAt: 'asc' }],
    });

    const eligibleUsers = users
      .filter((candidate) => meetsRankRequirement(candidate.rank, party.quest.difficulty))
      .slice(0, 8);

    return Response.json({ users: eligibleUsers, success: true });
  } catch (error) {
    console.error('Error searching eligible party members:', error);
    return Response.json({ error: 'Failed to search party members', success: false }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const params = await props.params;
    const body = (await request.json()) as Record<string, unknown>;
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!userId) {
      return Response.json({ error: 'userId is required', success: false }, { status: 400 });
    }

    const party = await prisma.party.findUnique({
      where: { id: params.id },
      include: {
        quest: {
          select: {
            difficulty: true,
          },
        },
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!party) {
      return Response.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && party.leaderId !== user.id) {
      return Response.json({ error: 'Only the party leader can add members', success: false }, { status: 403 });
    }

    if (party.members.length >= party.maxSize) {
      return Response.json({ error: 'Party is already full', success: false }, { status: 400 });
    }

    if (party.members.some((member) => member.userId === userId)) {
      return Response.json({ error: 'User is already in this party', success: false }, { status: 409 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        rank: true,
        bootcampLink: {
          select: { id: true },
        },
      },
    });

    if (!targetUser || !targetUser.isActive || targetUser.role !== 'adventurer') {
      return Response.json({ error: 'Target user must be an active adventurer', success: false }, { status: 400 });
    }

    if (party.track === 'BOOTCAMP' && !targetUser.bootcampLink) {
      return Response.json({ error: 'Bootcamp parties can only include bootcamp adventurers', success: false }, { status: 403 });
    }

    if (!meetsRankRequirement(targetUser.rank, party.quest.difficulty)) {
      return Response.json(
        { error: `Adventurers must be at least ${party.quest.difficulty}-Rank for this quest party`, success: false },
        { status: 403 }
      );
    }

    const updatedParty = await prisma.$transaction(async (tx) => {
      await tx.partyMember.create({
        data: {
          partyId: party.id,
          userId,
          isLeader: false,
        },
      });

      return tx.party.findUnique({
        where: { id: party.id },
        include: PARTY_INCLUDE,
      });
    });

    return Response.json({ party: updatedParty, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding party member:', error);
    return Response.json({ error: 'Failed to add party member', success: false }, { status: 500 });
  }
}
