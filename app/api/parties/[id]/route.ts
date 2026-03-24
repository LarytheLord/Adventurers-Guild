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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const params = await props.params;

  try {
    const party = await prisma.party.findUnique({
      where: { id: params.id },
      include: PARTY_INCLUDE,
    });

    if (!party) {
      return Response.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    return Response.json({ party, success: true });
  } catch (error) {
    console.error('Error fetching party:', error);
    return Response.json({ error: 'Failed to fetch party', success: false }, { status: 500 });
  }
}
