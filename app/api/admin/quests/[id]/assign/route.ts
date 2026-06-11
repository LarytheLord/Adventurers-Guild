import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { logActivity } from '@/lib/activity-logger';
import { Prisma } from '@prisma/client';

// POST /api/admin/quests/[id]/assign
// Body: { userId: string }
// Admin-forces an assignment without going through the normal apply flow.
// Skips rank gating and slot checks — admin override is intentional.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAuth(request, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { id: questId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required', success: false }, { status: 400 });
    }

    // Verify quest exists and is in an assignable state
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { id: true, title: true, status: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (quest.status === 'cancelled' || quest.status === 'completed') {
      return NextResponse.json(
        { error: `Cannot assign to a ${quest.status} quest`, success: false },
        { status: 400 }
      );
    }

    // Verify target user exists and is an adventurer
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 });
    }

    if (targetUser.role !== 'adventurer') {
      return NextResponse.json(
        { error: 'Can only assign adventurers to quests', success: false },
        { status: 400 }
      );
    }

    // Create assignment inside a transaction, sync lifecycle
    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.questAssignment.create({
        data: { questId, userId, status: 'assigned' },
      });
      await syncQuestLifecycleStatus(tx, questId);
      await logActivity(userId, 'quest_apply', { questId, assignedByAdmin: admin.id }, tx);
      return created;
    });

    return NextResponse.json({ assignment, success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This user is already assigned to the quest', success: false },
        { status: 409 }
      );
    }
    console.error('Admin assign error:', error);
    return NextResponse.json({ error: 'Failed to assign quest', success: false }, { status: 500 });
  }
}
