import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AssignmentStatus } from '@prisma/client';

// GET /api/quests/[id]/assignments — list all assignments for a quest (company/admin only)
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
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
    if (session.user.role !== 'admin' && quest.companyId !== session.user.id) {
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
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

    if (session.user.role !== 'admin' && quest.companyId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Map frontend status to DB enum
    const newStatus: AssignmentStatus = status === 'accepted' ? 'started' : 'cancelled';

    const updated = await prisma.questAssignment.update({
      where: { id: assignmentId },
      data: {
        status: newStatus,
        ...(newStatus === 'started' ? { startedAt: new Date() } : {}),
      },
    });

    // If rejected and no other active assignments, revert quest to available
    if (newStatus === 'cancelled') {
      const active = await prisma.questAssignment.count({
        where: {
          questId: params.id,
          status: { notIn: ['cancelled', 'completed'] },
        },
      });
      if (active === 0) {
        await prisma.quest.update({
          where: { id: params.id },
          data: { status: 'available' },
        });
      }
    }

    return NextResponse.json({ assignment: updated, success: true });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment', success: false }, { status: 500 });
  }
}
