import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/parties/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request, 'adventurer', 'company', 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const { id } = await params;

  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, name: true, rank: true } },
      members: {
        include: { user: { select: { id: true, name: true, rank: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });

  if (!party) {
    return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
  }

  return NextResponse.json({ party, success: true });
}
