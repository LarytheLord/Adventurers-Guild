import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { buildQuestWorkflowActor, recordQuestWorkflowEvent } from '@/lib/quest-workflow-events';

// PATCH /api/admin/qa-queue/[assignmentId] — approve or reject submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  const { id: adminId } = user;

  const { assignmentId } = await params;
  const actor = buildQuestWorkflowActor(user);

  let body: { action?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', success: false }, { status: 400 });
  }

  const { action, notes } = body;
  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be "approve" or "reject"', success: false }, { status: 400 });
  }
  if (action === 'reject' && (!notes || notes.trim().length === 0)) {
    return NextResponse.json({ error: 'notes are required when rejecting', success: false }, { status: 400 });
  }

  const assignment = await prisma.questAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      quest: { select: { id: true } },
      submissions: { orderBy: { submittedAt: 'desc' }, take: 1 },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
  }
  if (assignment.status !== 'pending_admin_review') {
    return NextResponse.json(
      { error: 'Assignment is not in pending_admin_review status', success: false },
      { status: 400 }
    );
  }

  if (action === 'approve') {
    await prisma.$transaction(async (tx) => {
      await tx.questAssignment.update({
        where: { id: assignmentId },
        data: { status: 'review' },
      });

      await recordQuestWorkflowEvent(tx, {
        questId: assignment.quest.id,
        assignmentId,
        submissionId: assignment.submissions[0]?.id ?? null,
        actorUserId: actor.userId,
        actorRole: actor.role,
        eventType: 'assignment_status_changed',
        payload: {
          previousStatus: assignment.status,
          nextStatus: 'review',
          trigger: 'admin_qa_approve',
        },
      });

      await syncQuestLifecycleStatus(tx, assignment.quest.id, {
        ...actor,
        assignmentId,
        submissionId: assignment.submissions[0]?.id ?? null,
        trigger: 'admin_qa_approve',
      });
    });

    return NextResponse.json({ message: 'Submission approved — forwarded to client review', success: true });
  }

  // reject — append admin note to submission reviewNotes (stored as JSON string)
  const latestSubmission = assignment.submissions[0];
  let existingNotes: Record<string, string>[] = [];
  if (latestSubmission?.reviewNotes) {
    try { existingNotes = JSON.parse(latestSubmission.reviewNotes); } catch { existingNotes = []; }
  }
  const newNote: Record<string, string> = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    author: `Admin (${adminId})`,
    note: notes!.trim(),
  };
  const updatedNotes = JSON.stringify([...existingNotes, newNote]);

  await prisma.$transaction(async (tx) => {
    await tx.questAssignment.update({
      where: { id: assignmentId },
      data: { status: 'needs_rework' },
    });

    await tx.quest.update({
      where: { id: assignment.quest.id },
      data: { revisionCount: { increment: 1 } },
    });

    if (latestSubmission) {
      await tx.questSubmission.update({
        where: { id: latestSubmission.id },
        data: { reviewNotes: updatedNotes },
      });

      await recordQuestWorkflowEvent(tx, {
        questId: assignment.quest.id,
        assignmentId,
        submissionId: latestSubmission.id,
        actorUserId: actor.userId,
        actorRole: actor.role,
        eventType: 'submission_reviewed',
        payload: {
          previousStatus: latestSubmission.status,
          nextStatus: latestSubmission.status,
          trigger: 'admin_qa_reject',
        },
      });
    }

    await recordQuestWorkflowEvent(tx, {
      questId: assignment.quest.id,
      assignmentId,
      submissionId: latestSubmission?.id ?? null,
      actorUserId: actor.userId,
      actorRole: actor.role,
      eventType: 'assignment_status_changed',
      payload: {
        previousStatus: assignment.status,
        nextStatus: 'needs_rework',
        trigger: 'admin_qa_reject',
      },
    });

    await syncQuestLifecycleStatus(tx, assignment.quest.id, {
      ...actor,
      assignmentId,
      submissionId: latestSubmission?.id ?? null,
      trigger: 'admin_qa_reject',
    });
  });

  return NextResponse.json({ message: 'Submission rejected — returned to student for revision', success: true });
}
