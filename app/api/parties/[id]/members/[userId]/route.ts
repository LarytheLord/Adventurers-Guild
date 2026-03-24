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

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await requireAuth(request, 'adventurer', 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const params = await props.params;
    const party = await prisma.party.findUnique({
      where: { id: params.id },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            isLeader: true,
          },
        },
      },
    });

    if (!party) {
      return Response.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && party.leaderId !== user.id) {
      return Response.json({ error: 'Only the party leader can remove members', success: false }, { status: 403 });
    }

    const member = party.members.find((entry) => entry.userId === params.userId);
    if (!member) {
      return Response.json({ error: 'Party member not found', success: false }, { status: 404 });
    }

    if (member.isLeader || params.userId === party.leaderId) {
      return Response.json({ error: 'The party leader cannot be removed', success: false }, { status: 400 });
    }

    const updatedParty = await prisma.$transaction(async (tx) => {
      await tx.partyMember.delete({
        where: { id: member.id },
      });

      return tx.party.findUnique({
        where: { id: party.id },
        include: PARTY_INCLUDE,
      });
    });

    return Response.json({ party: updatedParty, success: true });
  } catch (error) {
    console.error('Error removing party member:', error);
    return Response.json({ error: 'Failed to remove party member', success: false }, { status: 500 });
  }
}
