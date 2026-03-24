import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// DELETE /api/parties/[id]/members/[userId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const user = await requireAuth(request, 'adventurer', 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  const { id: callerId, role } = user;

  const { id: partyId, userId: targetUserId } = await params;

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    select: { leaderId: true },
  });

  if (!party) {
    return NextResponse.json({ error: 'Party not found', success: false }, { status: 404 });
  }
  if (role !== 'admin' && party.leaderId !== callerId) {
    return NextResponse.json({ error: 'Only the party leader can remove members', success: false }, { status: 403 });
  }
  if (targetUserId === party.leaderId) {
    return NextResponse.json({ error: 'The party leader cannot be removed', success: false }, { status: 400 });
  }

  const member = await prisma.partyMember.findUnique({
    where: { partyId_userId: { partyId, userId: targetUserId } },
  });
  if (!member) {
    return NextResponse.json({ error: 'User is not a member of this party', success: false }, { status: 404 });
  }

  await prisma.partyMember.delete({ where: { partyId_userId: { partyId, userId: targetUserId } } });

  return NextResponse.json({ success: true });
}
