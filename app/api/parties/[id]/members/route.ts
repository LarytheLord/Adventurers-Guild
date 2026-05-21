import { UserRank } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { notifyDiscord } from '@/lib/discord-notify';
import { QuestTrack } from '@prisma/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PARTY_INCLUDE = {
  quest: { select: { id: true, title: true } },
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

function meetsRankRequirement(candidateRank: UserRank, requiredRank: UserRank) {
  return RANK_VALUES[candidateRank] >= RANK_VALUES[requiredRank];
}

// GET /api/parties/[id]/members — search eligible members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const { id: partyId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';

    if (!search) {
      return NextResponse.json({ users: [], success: true });
    }

    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        quest: { select: { difficulty: true } },
        members: { select: { userId: true } },
      },
    });

    if (!party) {
      return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && party.leaderId !== user.id) {
      return NextResponse.json({ error: 'Only the party leader can search for members', success: false }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'adventurer',
        isActive: true,
        id: { notIn: party.members.map((m) => m.userId) },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
        ...(party.track === QuestTrack.BOOTCAMP ? { bootcampLink: { isNot: null } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        rank: true,
        avatar: true,
        bootcampLink: { select: { id: true } },
      },
      take: 24,
      orderBy: [{ rank: 'desc' }, { createdAt: 'asc' }],
    });

    const eligibleUsers = users
      .filter((u) => meetsRankRequirement(u.rank, party.quest.difficulty))
      .slice(0, 8);

    return NextResponse.json({ users: eligibleUsers, success: true });
  } catch (error) {
    console.error('Error searching party members:', error);
    return NextResponse.json({ error: 'Failed to search party members', success: false }, { status: 500 });
  }
}

// POST /api/parties/[id]/members — add a member (leader only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    const { id: callerId, role } = user;

    const { id: partyId } = await params;

    let body: { userId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON', success: false }, { status: 400 });
    }

    const { userId: targetUserId } = body;
    if (!targetUserId || !UUID_REGEX.test(targetUserId)) {
      return NextResponse.json({ error: 'userId is required and must be a valid UUID', success: false }, { status: 400 });
    }

    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        quest: { select: { difficulty: true } },
        members: true,
      },
    });

    if (!party) {
      return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    const isSelfJoin = targetUserId === callerId;
    if (role !== 'admin' && party.leaderId !== callerId && !isSelfJoin) {
      return NextResponse.json({ error: 'Only the party leader can add members', success: false }, { status: 403 });
    }
    if (party.members.length >= party.maxSize) {
      return NextResponse.json({ error: `Party is full (max ${party.maxSize} members)`, success: false }, { status: 400 });
    }
    if (party.members.some((m) => m.userId === targetUserId)) {
      return NextResponse.json({ error: 'User is already a party member', success: false }, { status: 409 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, rank: true },
    });
    if (!targetUser || targetUser.role !== 'adventurer') {
      return NextResponse.json({ error: 'Target user not found or is not an adventurer', success: false }, { status: 400 });
    }

    if (!meetsRankRequirement(targetUser.rank, party.quest.difficulty)) {
      return NextResponse.json(
        { error: `Adventurer must be at least ${party.quest.difficulty}-Rank for this quest`, success: false },
        { status: 403 }
      );
    }

    if (party.track === QuestTrack.BOOTCAMP) {
      const link = await prisma.bootcampLink.findUnique({ where: { userId: targetUserId }, select: { id: true } });
      if (!link) {
        return NextResponse.json({ error: 'Bootcamp track parties require bootcamp-enrolled members', success: false }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.partyMember.create({ data: { partyId, userId: targetUserId, isLeader: false } });
      return tx.party.findUnique({
        where: { id: partyId },
        include: PARTY_INCLUDE,
      });
    });

    // Send Discord notification for party invitation
    if (updated) {
      const invitedUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { name: true, email: true },
      });
      const invitedByUser = await prisma.user.findUnique({
        where: { id: callerId },
        select: { name: true },
      });

      if (invitedUser && updated.quest && invitedByUser) {
        const message = `
🎉 **Party Invitation**
${invitedByUser.name} invited ${invitedUser.name} (${invitedUser.email}) to join the squad for **${updated.quest.title}**
Track: ${party.track}
Party: ${updated.members.length}/${updated.maxSize} members
        `.trim();
        await notifyDiscord('quests', message);
      }
    }

    return NextResponse.json({ party: updated, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding party member:', error);
    return NextResponse.json({ error: 'Failed to add party member', success: false }, { status: 500 });
  }
}