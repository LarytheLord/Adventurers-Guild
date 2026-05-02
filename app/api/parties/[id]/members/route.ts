import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { notifyDiscord } from '@/lib/discord-notify';
import { QuestTrack } from '@prisma/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/parties/[id]/members — add a member (leader only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    include: { members: true },
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
    select: { id: true, role: true },
  });
  if (!targetUser || targetUser.role !== 'adventurer') {
    return NextResponse.json({ error: 'Target user not found or is not an adventurer', success: false }, { status: 400 });
  }

  if (party.track === QuestTrack.BOOTCAMP) {
    const link = await prisma.bootcampLink.findUnique({ where: { userId: targetUserId }, select: { id: true } });
    if (!link) {
      return NextResponse.json({ error: 'Bootcamp track parties require bootcamp-enrolled members', success: false }, { status: 400 });
    }
  }

  await prisma.partyMember.create({ data: { partyId, userId: targetUserId, isLeader: false } });

  const updated = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      quest: { select: { title: true } },
      leader: { select: { id: true, name: true, rank: true } },
      members: {
        include: { user: { select: { id: true, name: true, rank: true, email: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
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
}
