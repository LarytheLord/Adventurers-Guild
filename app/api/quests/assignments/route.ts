// app/api/quests/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-logger';
import { applyToQuest, getAssignments } from '@/lib/services/assignment-service';

export async function GET(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
    // Parse query parameters
    const { searchParams } = new URL(request.url);   

    // Build where clause based on permissions
    const result = await getAssignments(searchParams, user);
    if (result.error) {
      return NextResponse.json({ error: result.error, success: false }, { status: result.status });
    }
    return NextResponse.json({ assignments: result.data, success: true });
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  if (user.role !== 'adventurer' && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only adventurers can apply to quests', success: false },
      { status: 403 }
    );
  }
  const body = await request.json();
  const { questId } = body;
  const result = await applyToQuest(questId, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ assignment: result.data, success: true }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assignmentId, status, progress } = body;
    const userId = user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignmentId || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    const requestedStatus = status as AssignmentStatus;
    const adminStatuses: AssignmentStatus[] = [
      'assigned',
      'started',
      'in_progress',
      'submitted',
      'pending_admin_review',
      'review',
      'completed',
      'cancelled',
      'needs_rework',
    ];
    const adventurerStatuses: AssignmentStatus[] = ['started', 'in_progress'];
    const allowedStatuses = user.role === 'admin' ? adminStatuses : adventurerStatuses;

    if (!allowedStatuses.includes(requestedStatus)) {
      return NextResponse.json({ error: 'Invalid assignment status transition', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this assignment
    // Only the assigned user or an admin can update the assignment
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { userId: true, questId: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    if (assignment.userId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to update this assignment', success: false }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { status: requestedStatus };
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return NextResponse.json({ error: 'progress must be a number between 0 and 100', success: false }, { status: 400 });
      }
      updateData.progress = progress;
    }
    if (requestedStatus === 'started') {
      updateData.startedAt = new Date();
    }
    if (requestedStatus === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedAssignment = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.questAssignment.update({
          where: { id: assignmentId },
          data: updateData,
        });

        await syncQuestLifecycleStatus(tx, assignment.questId);
        return updated;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    return NextResponse.json({ assignment: updatedAssignment, success: true });
  } catch (error) {
    console.error('Error updating quest assignment:', error);
    return NextResponse.json({ error: 'Failed to update quest assignment', success: false }, { status: 500 });
  }
}
