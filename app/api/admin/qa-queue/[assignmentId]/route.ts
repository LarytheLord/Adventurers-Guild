import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// PATCH /api/admin/qa-queue/[assignmentId] — approve or reject submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  const { id: adminId } = user;

  const { assignmentId } = await params;

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
    await prisma.questAssignment.update({
      where: { id: assignmentId },
      data: { status: 'review' },
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

  await prisma.$transaction([
    prisma.questAssignment.update({
      where: { id: assignmentId },
      data: { status: 'needs_rework' },
    }),
    prisma.quest.update({
      where: { id: assignment.quest.id },
      data: { revisionCount: { increment: 1 } },
    }),
    ...(latestSubmission
      ? [prisma.questSubmission.update({
          where: { id: latestSubmission.id },
          data: { reviewNotes: updatedNotes },
        })]
      : []),
  ]);

  return NextResponse.json({ message: 'Submission rejected — returned to student for revision', success: true });
}
