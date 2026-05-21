import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const { id } = await params;

    const party = await prisma.party.findUnique({
      where: { id },
      include: PARTY_INCLUDE,
    });

    if (!party) {
      return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
    }

    return NextResponse.json({ party, success: true });
  } catch (error) {
    console.error('Error fetching party:', error);
    return NextResponse.json({ error: 'Failed to fetch party', success: false }, { status: 500 });
  }
}