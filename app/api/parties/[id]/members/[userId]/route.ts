import { NextRequest, NextResponse } from 'next/server';
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    const { id: callerId, role } = user;

    const { id: partyId, userId: targetUserId } = await params;

    const party = await prisma.party.findUnique({
      where: { id: partyId },
      select: { leaderId: true, members: { select: { id: true, userId: true, isLeader: true } } },
    });

    if (!party) {
      return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
    }
    if (role !== 'admin' && party.leaderId !== callerId) {
      return NextResponse.json({ error: 'Only the party leader can remove members', success: false }, { status: 403 });
    }

    const member = party.members.find((m) => m.userId === targetUserId);
    if (!member) {
      return NextResponse.json({ error: 'User is not a member of this party', success: false }, { status: 404 });
    }
    if (member.isLeader || targetUserId === party.leaderId) {
      return NextResponse.json({ error: 'The party leader cannot be removed', success: false }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.partyMember.delete({ where: { id: member.id } });
      return tx.party.findUnique({
        where: { id: partyId },
        include: PARTY_INCLUDE,
      });
    });

    return NextResponse.json({ party: updated, success: true });
  } catch (error) {
    console.error('Error removing party member:', error);
    return NextResponse.json({ error: 'Failed to remove party member', success: false }, { status: 500 });
  }
}