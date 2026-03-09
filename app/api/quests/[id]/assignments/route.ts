import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus } from '@prisma/client';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/quests/[id]/assignments — list all assignments for a quest (company/admin only)
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    // Verify quest exists and user has permission
    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    // Only the owning company or admin can see all assignments
    if (user.role !== 'admin' && quest.companyId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    const assignments = await prisma.questAssignment.findMany({
      where: { questId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            rank: true,
            xp: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments, success: true });
  } catch (error) {
    console.error('Error fetching quest assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments', success: false }, { status: 500 });
  }
}

// PUT /api/quests/[id]/assignments — accept or reject an applicant (company/admin only)
// Body: { assignmentId: string, status: 'accepted' | 'rejected' }
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { assignmentId, status } = body;

    if (!assignmentId || !status) {
      return NextResponse.json({ error: 'assignmentId and status are required', success: false }, { status: 400 });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'status must be accepted or rejected', success: false }, { status: 400 });
    }

    // Verify the quest exists and the caller owns it
    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && quest.companyId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    const existingAssignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { questId: true, status: true },
    });

    if (!existingAssignment || existingAssignment.questId !== params.id) {
      return NextResponse.json({ error: 'Assignment not found for this quest', success: false }, { status: 404 });
    }

    if (existingAssignment.status !== 'assigned') {
      return NextResponse.json(
        { error: 'Only pending applicants can be accepted or rejected', success: false },
        { status: 400 }
      );
    }

    // Map frontend status to DB enum
    const newStatus: AssignmentStatus = status === 'accepted' ? 'started' : 'cancelled';

    const updated = await prisma.$transaction(
      async (tx) => {
        const assignment = await tx.questAssignment.update({
          where: { id: assignmentId },
          data: {
            status: newStatus,
            ...(newStatus === 'started' ? { startedAt: new Date() } : {}),
          },
        });

        await syncQuestLifecycleStatus(tx, params.id);
        return assignment;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    return NextResponse.json({ assignment: updated, success: true });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment', success: false }, { status: 500 });
  }
}
