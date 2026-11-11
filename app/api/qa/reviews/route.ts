import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { Prisma } from '@prisma/client';

const VALID_REVIEW_STATUSES = ['pending', 'under_review', 'approved', 'needs_rework', 'rejected'] as const;
type ReviewStatus = (typeof VALID_REVIEW_STATUSES)[number];

class AlreadyProcessedError extends Error {
  constructor() {
    super('Already processed');
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const reviewerId = searchParams.get('reviewer_id');
    const questId = searchParams.get('questId');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') ?? '10', 10) || 10;
    const offset = Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    if (reviewerId && authUser.role !== 'admin' && reviewerId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    const whereClause: Record<string, unknown> = {};
    if (submissionId) whereClause.id = submissionId;
    if (status) whereClause.status = status;

    const assignmentFilter: Record<string, unknown> = {};
    if (questId) assignmentFilter.questId = questId;
    if (authUser.role !== 'admin') {
      assignmentFilter.quest = { companyId: authUser.id };
      if (reviewerId) {
        whereClause.reviewerId = authUser.id;
      }
    } else if (reviewerId) {
      whereClause.reviewerId = reviewerId;
    }

    if (Object.keys(assignmentFilter).length > 0) {
      whereClause.assignment = assignmentFilter;
    }

    const data = await prisma.questSubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        assignmentId: true,
        userId: true,
        submissionContent: true,
        submissionNotes: true,
        submittedAt: true,
        status: true,
        reviewerId: true,
        reviewedAt: true,
        reviewNotes: true,
        qualityScore: true,
        assignment: {
          select: {
            questId: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            rank: true,
          },
        },
        reviewer: {
          select: {
            name: true,
            email: true,
            rank: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      skip: offset,
      take: Math.min(limit, 50),
    });

    return NextResponse.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching submissions for review:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const requiredFields = ['submissionId', 'quality_score', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    const submissionId = typeof body.submissionId === 'string' ? body.submissionId : '';
    const status =
      typeof body.status === 'string' && VALID_REVIEW_STATUSES.includes(body.status as ReviewStatus)
        ? (body.status as ReviewStatus)
        : null;
    const qualityScore =
      typeof body.quality_score === 'number'
        ? Math.min(Math.max(Math.trunc(body.quality_score), 0), 100)
        : null;

    if (!submissionId || !status || qualityScore === null) {
      return NextResponse.json(
        { error: 'submissionId, status and quality_score are required', success: false },
        { status: 400 }
      );
    }

    const existingSubmission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        status: true,
        assignmentId: true,
        assignment: {
          select: {
            questId: true,
            userId: true,
            quest: {
              select: {
                companyId: true,
              },
            },
          },
        },
      },
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && existingSubmission.assignment.quest?.companyId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    const reviewData = {
      status,
      reviewerId: authUser.id,
      reviewedAt: new Date(),
      reviewNotes: typeof body.review_notes === 'string' ? (body.review_notes as Prisma.InputJsonValue) : undefined,
      qualityScore,
    };

    // The status change and the completion record happen in one transaction.
    // For approvals, the status check is part of the UPDATE itself, so when several
    // approvals arrive together only one of them can claim it (#458).
    let outcome;
    try {
      outcome = await prisma.$transaction(async (tx) => {
        // Lock order is assignment row first, then submission row, in every QA route
        // (this one, /api/quests/submissions, the admin qa-queue). Taking them in
        // opposite orders in different routes can deadlock (Postgres 40P01).
        if (status === 'approved') {
          // The assignment row is shared with the other approval paths. If it is
          // already completed, another path got there first.
          const assignmentClaim = await tx.questAssignment.updateMany({
            where: { id: existingSubmission.assignmentId, status: { not: 'completed' } },
            data: { status: 'completed', completedAt: new Date() },
          });
          if (assignmentClaim.count !== 1) {
            return { alreadyProcessed: true as const };
          }

          // If the submission claim is lost, throw so the assignment claim above is
          // rolled back.
          const claim = await tx.questSubmission.updateMany({
            where: { id: submissionId, status: { notIn: ['approved', 'superseded'] } },
            data: reviewData,
          });
          if (claim.count !== 1) {
            throw new AlreadyProcessedError();
          }
          const data = await tx.questSubmission.findUniqueOrThrow({ where: { id: submissionId } });

          const quest = await tx.quest.findUnique({
            where: { id: existingSubmission.assignment.questId },
            select: { xpReward: true, skillPointsReward: true, title: true },
          });

          if (!quest) {
            throw new Error('Quest not found');
          }

          // Record quest completion (upsert so a failed insert cannot abort the transaction)
          await tx.questCompletion.upsert({
            where: {
              questId_userId: {
                questId: existingSubmission.assignment.questId,
                userId: existingSubmission.assignment.userId,
              },
            },
            create: {
              questId: existingSubmission.assignment.questId,
              userId: existingSubmission.assignment.userId,
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore,
            },
            update: {
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore,
            },
          });

          return { alreadyProcessed: false as const, data, quest };
        }

        if (status === 'needs_rework' || status === 'rejected') {
          await tx.questAssignment.update({
            where: { id: existingSubmission.assignmentId },
            data: { status: 'in_progress' },
          });
        }

        // Only valid from the status we read above, and never from an already approved
        // (or superseded) submission. If the claim is lost, throw so the assignment
        // write above is rolled back.
        const claim = await tx.questSubmission.updateMany({
          where: { id: submissionId, status: { equals: existingSubmission.status, notIn: ['approved', 'superseded'] } },
          data: reviewData,
        });
        if (claim.count !== 1) {
          throw new AlreadyProcessedError();
        }
        const data = await tx.questSubmission.findUniqueOrThrow({ where: { id: submissionId } });
        return { alreadyProcessed: false as const, data, quest: null };
      });
    } catch (txError) {
      if (txError instanceof AlreadyProcessedError) {
        return NextResponse.json({ error: 'Submission already processed', success: false }, { status: 409 });
      }
      throw txError;
    }

    if (outcome.alreadyProcessed) {
      return NextResponse.json({ error: 'Submission already processed', success: false }, { status: 409 });
    }

    const { data, quest } = outcome;

    if (quest) {
      // Update user XP, level, rank, and skill points
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        existingSubmission.assignment.userId,
        quest.xpReward,
        quest.skillPointsReward,
        existingSubmission.assignment.questId
      );

      // Bootcamp tutorial completion tracking (required for tutorial gating)
      if (quest.title.startsWith('Tutorial:')) {
        const bootcampLink = await prisma.bootcampLink.findUnique({
          where: { userId: existingSubmission.assignment.userId },
          select: { tutorialQuest1Complete: true, tutorialQuest2Complete: true },
        });

        if (bootcampLink) {
          const updateData: {
            tutorialQuest1Complete?: boolean;
            tutorialQuest2Complete?: boolean;
            eligibleForRealQuests?: boolean;
          } = {};

          if (quest.title.startsWith('Tutorial: First Blood')) updateData.tutorialQuest1Complete = true;
          if (quest.title.startsWith('Tutorial: Party Up')) updateData.tutorialQuest2Complete = true;

          const tq1 = updateData.tutorialQuest1Complete ?? bootcampLink.tutorialQuest1Complete;
          const tq2 = updateData.tutorialQuest2Complete ?? bootcampLink.tutorialQuest2Complete;
          if (tq1 && tq2) updateData.eligibleForRealQuests = true;

          if (Object.keys(updateData).length > 0) {
            await prisma.bootcampLink.update({
              where: { userId: existingSubmission.assignment.userId },
              data: updateData,
            });
          }
        }
      }
    }

    await syncQuestLifecycleStatus(prisma, existingSubmission.assignment.questId);

    return NextResponse.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json({ error: 'Failed to review submission', success: false }, { status: 500 });
  }
}

// API to get quality statistics
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    await request.json();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in QA PUT:', error);
    return NextResponse.json({ error: 'Failed to process request', success: false }, { status: 500 });
  }
}
