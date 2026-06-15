import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { AssignmentStatus } from '@prisma/client';
import { z } from 'zod';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';

const VALID_ADVENTURER_TRANSITIONS: Partial<Record<AssignmentStatus, AssignmentStatus[]>> = {
  assigned: ['started'],
  started: ['in_progress'],
  in_progress: ['submitted'],
  needs_rework: ['submitted'],
};

const PatchSchema = z.object({
  status: z.nativeEnum(AssignmentStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  submissionContent: z.string().min(1).max(10000).optional(),
  submissionNotes: z.string().max(2000).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(_req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const assignment = await prisma.questAssignment.findUnique({
    where: { id },
    include: {
      quest: {
        select: {
          id: true, title: true, description: true, difficulty: true,
          xpReward: true, monetaryReward: true, questCategory: true,
          deadline: true, companyId: true,
        },
      },
    },
  });

  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  const isOwner = assignment.userId === user.id;
  const isAdmin = user.role === 'admin';
  const isCompanyOwner = user.role === 'company' && assignment.quest.companyId === user.id;

  if (!isOwner && !isAdmin && !isCompanyOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ assignment, success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const assignment = await prisma.questAssignment.findUnique({
    where: { id },
    include: { quest: { select: { companyId: true, id: true } } },
  });
  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  const isOwner = assignment.userId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status, progress, notes, submissionContent, submissionNotes } = parsed.data;

  // Validate student status transitions
  if (status && !isAdmin) {
    const allowed = VALID_ADVENTURER_TRANSITIONS[assignment.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${assignment.status} to ${status}` },
        { status: 422 }
      );
    }
  }

  // When a student submits, require submission content
  if (status === 'submitted' && !isAdmin && !submissionContent) {
    return NextResponse.json(
      { error: 'submissionContent is required when submitting a quest' },
      { status: 400 }
    );
  }

  // Student-submitted status maps to pending_admin_review — skips the intermediate submitted state
  const resolvedStatus = (status === 'submitted' && !isAdmin)
    ? ('pending_admin_review' as AssignmentStatus)
    : status;

  const updated = await prisma.$transaction(async (tx) => {
    const assignmentUpdate = await tx.questAssignment.update({
      where: { id },
      data: {
        ...(resolvedStatus && { status: resolvedStatus }),
        ...(progress !== undefined && { progress }),
        ...(notes !== undefined && { notes }),
        ...(status === 'started' && !assignment.startedAt && { startedAt: new Date() }),
        ...(status === 'submitted' && { submittedAt: new Date() }),
        ...(resolvedStatus === 'completed' && { completedAt: new Date() }),
      },
    });

    // Create submission record so it appears in the admin QA queue
    if (status === 'submitted' && submissionContent) {
      await tx.questSubmission.create({
        data: {
          assignmentId: id,
          userId: user.id,
          submissionContent,
          ...(submissionNotes ? { submissionNotes } : {}),
          status: 'pending',
        },
      });
    }

    await syncQuestLifecycleStatus(tx, assignment.quest.id);
    return assignmentUpdate;
  });

  return NextResponse.json({ assignment: updated, success: true });
}
