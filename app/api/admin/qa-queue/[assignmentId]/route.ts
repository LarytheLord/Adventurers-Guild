import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const { assignmentId } = await params;

  const assignment = await prisma.questAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      status: true,
      assignedAt: true,
      startedAt: true,
      completedAt: true,
      progress: true,
      quest: {
        select: {
          id: true,
          title: true,
          track: true,
          difficulty: true,
          xpReward: true,
          monetaryReward: true,
          detailedDescription: true,
          acceptanceCriteria: true,
          briefData: true,
          fieldTemplate: { select: { briefFields: true, submissionFields: true } },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          rank: true,
          bootcampLink: {
            select: { cohort: true, bootcampTrack: true, bootcampWeek: true },
          },
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          submissionContent: true,
          submissionNotes: true,
          submissionData: true,
          submittedAt: true,
          reviewNotes: true,
          criteriaResults: true,
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
  }

  return NextResponse.json({ assignment, success: true });
}

// PATCH /api/admin/qa-queue/[assignmentId] — approve or reject submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  const { id: adminId } = user;

  const { assignmentId } = await params;

  let body: { action?: string; notes?: string; criteriaResults?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', success: false }, { status: 400 });
  }

  const { action, notes, criteriaResults } = body;
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

  const latestSubmission = assignment.submissions[0];
  // The per-criterion evaluation the PM/QA recorded against the brief's acceptance criteria.
  const criteriaJson =
    criteriaResults != null ? (criteriaResults as Prisma.InputJsonValue) : undefined;

  if (action === 'approve') {
    await prisma.$transaction(async (tx) => {
      await tx.questAssignment.update({
        where: { id: assignmentId },
        data: { status: 'review' },
      });
      if (latestSubmission && criteriaJson !== undefined) {
        await tx.questSubmission.update({
          where: { id: latestSubmission.id },
          data: { criteriaResults: criteriaJson, reviewerId: adminId, reviewedAt: new Date() },
        });
      }
      await syncQuestLifecycleStatus(tx, assignment.quest.id);
    });
    return NextResponse.json({ message: 'Submission approved — forwarded to client review', success: true });
  }

  // reject — append QA note to submission reviewNotes (stored as JSON string) + record criteria
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
        data: {
          reviewNotes: updatedNotes,
          reviewerId: adminId,
          reviewedAt: new Date(),
          ...(criteriaJson !== undefined ? { criteriaResults: criteriaJson } : {}),
        },
      });
    }
    await syncQuestLifecycleStatus(tx, assignment.quest.id);
  });

  return NextResponse.json({ message: 'Submission rejected — returned to student for revision', success: true });
}
