import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';

class AlreadyProcessedError extends Error {
  constructor() {
    super('Already processed');
  }
}

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
          qaCriteria: true,
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
      quest: { select: { id: true, xpReward: true, skillPointsReward: true, title: true, source: true } },
      user: { select: { id: true } },
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
    const questRewards = await prisma.$transaction(async (tx) => {
      // Claim the transition atomically: the status check and the write are one UPDATE,
      // so only one of several concurrent reviews can win it (#458).
      const claim = await tx.questAssignment.updateMany({
        where: { id: assignmentId, status: 'pending_admin_review' },
        data: { status: 'completed', completedAt: new Date() },
      });
      if (claim.count !== 1) return null;

      const submissionUpdateData: Record<string, unknown> = {
        status: 'approved',
        reviewerId: adminId,
        reviewedAt: new Date(),
      };
      if (criteriaJson !== undefined) {
        submissionUpdateData.criteriaResults = criteriaJson;
      }
      if (latestSubmission) {
        await tx.questSubmission.update({
          where: { id: latestSubmission.id },
          data: submissionUpdateData,
        });
      }

      const quest = await tx.quest.findUnique({
        where: { id: assignment.quest.id },
        select: { xpReward: true, skillPointsReward: true, title: true, source: true },
      });
      if (!quest) throw new Error('Quest not found');

      await tx.questCompletion.upsert({
        where: {
          questId_userId: {
            questId: assignment.quest.id,
            userId: assignment.user.id,
          },
        },
        create: {
          questId: assignment.quest.id,
          userId: assignment.user.id,
          xpEarned: quest.xpReward,
          skillPointsEarned: quest.skillPointsReward,
        },
        update: {
          xpEarned: quest.xpReward,
          skillPointsEarned: quest.skillPointsReward,
        },
      });

      await syncQuestLifecycleStatus(tx, assignment.quest.id);

      return quest;
    });

    if (!questRewards) {
      return NextResponse.json({ error: 'Assignment already processed', success: false }, { status: 409 });
    }

    let xpAwardFailed = false;
    try {
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        assignment.user.id,
        questRewards.xpReward,
        questRewards.skillPointsReward,
        assignment.quest.id,
      );
    } catch (xpError) {
      console.error('[qa-queue] XP award failed for assignment', assignmentId, '— quest is marked complete but XP was not granted:', xpError);
      xpAwardFailed = true;
    }

    // Bootcamp tutorial tracking
    if (questRewards.source === 'TUTORIAL') {
      const bootcampLink = await prisma.bootcampLink.findUnique({
        where: { userId: assignment.user.id },
        select: { tutorialQuest1Complete: true, tutorialQuest2Complete: true },
      });
      if (bootcampLink) {
        const updateData: Record<string, boolean> = {};
        if (questRewards.title.startsWith('Tutorial: First Blood')) updateData.tutorialQuest1Complete = true;
        if (questRewards.title.startsWith('Tutorial: Party Up')) updateData.tutorialQuest2Complete = true;
        const tq1 = updateData.tutorialQuest1Complete ?? bootcampLink.tutorialQuest1Complete;
        const tq2 = updateData.tutorialQuest2Complete ?? bootcampLink.tutorialQuest2Complete;
        if (tq1 && tq2) updateData.eligibleForRealQuests = true;
        if (Object.keys(updateData).length > 0) {
          await prisma.bootcampLink.update({ where: { userId: assignment.user.id }, data: updateData });
        }
      }
    }

    return NextResponse.json({
      message: xpAwardFailed
        ? 'Quest approved and marked complete, but XP award failed — check server logs'
        : 'Quest completed — XP awarded',
      success: true,
      ...(xpAwardFailed && { xpAwardFailed: true }),
    });
  }

  // reject — append QA note to submission reviewNotes (now native Json array) + record criteria
  // Use direct array (Prisma Json) instead of stringify/parse to avoid silent data loss on parse errors.
  let existingNotes: any[] = [];
  if (latestSubmission?.reviewNotes) {
    if (Array.isArray(latestSubmission.reviewNotes)) {
      existingNotes = latestSubmission.reviewNotes;
    } else if (typeof latestSubmission.reviewNotes === 'string') {
      // legacy data from when field was String containing JSON
      try {
        const parsed = JSON.parse(latestSubmission.reviewNotes);
        existingNotes = Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error(
          '[qa-queue] Failed to parse legacy reviewNotes string for submission',
          latestSubmission.id,
          '— preserving no history for this append only (was non-JSON or corrupted). Review history may have been at risk.'
        );
        existingNotes = [];
      }
    } else {
      existingNotes = [];
    }
  }
  const newNote: Record<string, string> = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    author: `Admin (${adminId})`,
    note: notes!.trim(),
  };
  const updatedNotes = [...existingNotes, newNote];

  let rejected: boolean;
  try {
    rejected = await prisma.$transaction(async (tx) => {
      // Lock order is assignment row, then submission row, then quest row, the same
      // as the other QA routes. Taking them in different orders can deadlock
      // (Postgres 40P01).
      const claim = await tx.questAssignment.updateMany({
        where: { id: assignmentId, status: 'pending_admin_review' },
        data: { status: 'needs_rework' },
      });
      if (claim.count !== 1) return false;
      if (latestSubmission) {
        // Never send back a submission that is already approved. If the claim is
        // lost, throw so the assignment claim above is rolled back.
        const submissionClaim = await tx.questSubmission.updateMany({
          where: { id: latestSubmission.id, status: { notIn: ['approved', 'superseded'] } },
          data: {
            reviewNotes: updatedNotes,
            reviewerId: adminId,
            reviewedAt: new Date(),
            ...(criteriaJson !== undefined ? { criteriaResults: criteriaJson } : {}),
          },
        });
        if (submissionClaim.count !== 1) {
          throw new AlreadyProcessedError();
        }
      }
      await tx.quest.update({
        where: { id: assignment.quest.id },
        data: { revisionCount: { increment: 1 } },
      });
      await syncQuestLifecycleStatus(tx, assignment.quest.id);
      return true;
    });
  } catch (txError) {
    if (txError instanceof AlreadyProcessedError) {
      return NextResponse.json({ error: 'Assignment already processed', success: false }, { status: 409 });
    }
    throw txError;
  }

  if (!rejected) {
    return NextResponse.json({ error: 'Assignment already processed', success: false }, { status: 409 });
  }

  return NextResponse.json({ message: 'Submission rejected — returned to student for revision', success: true });
}
