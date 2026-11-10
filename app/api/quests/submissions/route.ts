// app/api/quests/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus, Prisma, SubmissionStatus } from '@prisma/client';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-logger';

class AlreadyProcessedError extends Error {
  constructor() {
    super('Already processed');
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const requestedUserId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    const currentUserId = user.id;
    const currentUserRole = user.role;

    // Build where clause based on permissions
    const where: Record<string, unknown> = {};

    if (currentUserRole === 'adventurer') {
      // Adventurers can only see their own submissions
      where.userId = currentUserId;
    } else if (currentUserRole === 'company') {
      // Companies can see submissions for their quests
      const companyQuests = await prisma.quest.findMany({
        where: { companyId: currentUserId },
        select: { id: true },
      });

      if (companyQuests.length === 0) {
        return NextResponse.json({ submissions: [], success: true });
      }

      const questIds = companyQuests.map(q => q.id);
      where.assignment = { questId: { in: questIds } };
    } else if (currentUserRole === 'admin') {
      // Admins can see all submissions - no additional filter needed
    } else {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Add filters if provided (respecting permissions)
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }
    if (requestedUserId && currentUserRole === 'admin') {
      where.userId = requestedUserId;
    }
    if (status) {
      where.status = status;
    }

    const data = await prisma.questSubmission.findMany({
      where,
      include: {
        assignment: {
          select: {
            questId: true,
            status: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    return NextResponse.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching quest submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch quest submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assignmentId, submissionContent, submissionNotes, submissionData } = body;
    const userId = user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignmentId || !submissionContent) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the assignment exists and belongs to the current user
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { status: true, userId: true, questId: true, quest: { select: { track: true } } },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Only the assigned user can submit
    if (assignment.userId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to submit for this assignment', success: false }, { status: 403 });
    }

    if (!['started', 'in_progress', 'needs_rework'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Invalid assignment state for submission', success: false }, { status: 400 });
    }

    // BOOTCAMP and INTERN quests go to pending_admin_review (Open Paws QA gate)
    // OPEN track goes directly to submitted (client sees immediately)
    const postSubmitStatus =
      assignment.quest.track !== 'OPEN' ? 'pending_admin_review' : 'submitted';

    const data = await prisma.$transaction(
      async (tx) => {
        const submission = await tx.questSubmission.create({
          data: {
            assignmentId: assignmentId,
            userId,
            submissionContent: submissionContent,
            submissionNotes: submissionNotes || null,
            submissionData: submissionData ?? Prisma.JsonNull,
          },
        });

        // Invalidate all previous submissions for this assignment so QA/client always sees the latest.
        // This prevents stale work from being reviewable (especially important for needs_rework resubmissions).
        await tx.questSubmission.updateMany({
          where: { assignmentId, id: { not: submission.id } },
          data: { status: SubmissionStatus.superseded },
        });

        await tx.questAssignment.update({
          where: { id: assignmentId },
          data: { status: postSubmitStatus },
        });

        await syncQuestLifecycleStatus(tx, assignment.questId);
        
        // Log activity
        await logActivity(userId, 'quest_submit', { questId: assignment.questId }, tx);
        
        return submission;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    return NextResponse.json({ submission: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest submission:', error);
    return NextResponse.json({ error: 'Failed to create quest submission', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { submissionId, status, review_notes, quality_score, criteria_results } = body;
    const reviewerId = user.id;

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    const submission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, assignmentId: true, status: true },
    });
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    if (submission.status === SubmissionStatus.superseded) {
      return NextResponse.json({ error: 'Cannot review a superseded submission', success: false }, { status: 400 });
    }

    const assignmentData = await prisma.questAssignment.findUnique({
      where: { id: submission.assignmentId },
      select: {
        questId: true,
        userId: true,
        startedAt: true,
        assignedAt: true,
        quest: {
          select: {
            companyId: true,
            title: true,
          },
        },
      },
    });
    if (!assignmentData) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Permission check
    if (user.role !== 'admin' &&
        (user.role !== 'company' || !assignmentData.quest || assignmentData.quest.companyId !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized to review this submission', success: false }, { status: 403 });
    }

    // Transaction for database updates (XP, status, etc.) – NO transaction creation here
    let reviewResult;
    try {
    reviewResult = await prisma.$transaction(
      async (tx) => {
        const submissionUpdate = {
          status,
          reviewNotes: review_notes || undefined,
          qualityScore: quality_score ?? undefined,
          criteriaResults: criteria_results ? (criteria_results as Prisma.InputJsonValue) : undefined,
          reviewerId,
          reviewedAt: status !== 'pending' ? new Date() : undefined,
        };

        // Every transition is claimed atomically: the status check and the write are
        // one UPDATE, so only one of several concurrent reviews can win it (#458).
        // Approve may come from any open status; the other transitions are only valid
        // from the status we read above.
        const claim = await tx.questSubmission.updateMany({
          where: {
            id: submissionId,
            status: status === 'approved' ? { notIn: ['approved', 'superseded'] } : submission.status,
          },
          data: submissionUpdate,
        });
        if (claim.count !== 1) {
          return { alreadyProcessed: true as const };
        }
        const updatedSubmission = await tx.questSubmission.findUniqueOrThrow({ where: { id: submissionId } });

        let newAssignmentStatus: AssignmentStatus | null = null;
        if (status === 'approved') {
          newAssignmentStatus = 'completed';
        } else if (status === 'needs_rework' || status === 'rejected') {
          newAssignmentStatus = 'in_progress';
        }

        if (status === 'approved') {
          // The assignment row is the one place every approval path (this route,
          // /api/qa/reviews, the admin qa-queue) has to go through, so claim it here.
          // If it is already completed another path got there first: throw so the
          // submission claim above is rolled back too.
          const assignmentClaim = await tx.questAssignment.updateMany({
            where: { id: submission.assignmentId, status: { not: 'completed' } },
            data: { status: 'completed', completedAt: new Date() },
          });
          if (assignmentClaim.count !== 1) {
            throw new AlreadyProcessedError();
          }
        } else if (newAssignmentStatus) {
          await tx.questAssignment.update({
            where: { id: submission.assignmentId },
            data: {
              status: newAssignmentStatus,
            },
          });
        }

        await syncQuestLifecycleStatus(tx, assignmentData.questId);

        let rewardsPayload: { userId: string; xpReward: number; skillPointsReward: number; questTitle: string; questSource: string } | null = null;
        let paymentInfo: { questId: string; userId: string; track: string; source: string; monetaryReward: number } | null = null;

        if (status === 'approved') {
          const quest = await tx.quest.findUnique({
            where: { id: assignmentData.questId },
            select: { 
              xpReward: true, 
              skillPointsReward: true,
              track: true,
              source: true,
              monetaryReward: true,
            },
          });
          if (!quest) throw new Error('Quest not found for completion recording');

          // Calculate daily standup penalty (5% per missed daily update)
          const startedTime = assignmentData.startedAt ?? assignmentData.assignedAt;
          const activeMs = new Date().getTime() - startedTime.getTime();
          const expectedUpdates = Math.floor(activeMs / (1000 * 60 * 60 * 24));
          
          const actualUpdatesCount = await tx.dailyUpdate.count({
            where: { assignmentId: submission.assignmentId }
          });
          
          let penaltyPercentage = 0;
          if (expectedUpdates > 0 && actualUpdatesCount < expectedUpdates) {
            const missedUpdates = expectedUpdates - actualUpdatesCount;
            penaltyPercentage = Math.min(100, missedUpdates * 5); // 5% per missed update, max 100%
          }
          
          const multiplier = 1 - (penaltyPercentage / 100);
          const finalXpReward = Math.round(quest.xpReward * multiplier);
          const finalSkillPointsReward = Math.round(quest.skillPointsReward * multiplier);
          const finalMonetaryReward = quest.monetaryReward ? Number(quest.monetaryReward) * multiplier : 0;

          await tx.questCompletion.upsert({
            where: {
              questId_userId: {
                questId: assignmentData.questId,
                userId: assignmentData.userId,
              },
            },
            create: {
              questId: assignmentData.questId,
              userId: assignmentData.userId,
              xpEarned: finalXpReward,
              skillPointsEarned: finalSkillPointsReward,
              qualityScore: quality_score ?? null,
            },
            update: {
              xpEarned: finalXpReward,
              skillPointsEarned: finalSkillPointsReward,
              qualityScore: quality_score ?? null,
            },
          });

          rewardsPayload = {
            userId: assignmentData.userId,
            xpReward: finalXpReward,
            skillPointsReward: finalSkillPointsReward,
            questTitle: assignmentData.quest?.title ?? '',
            questSource: quest.source,
          };

          // Prepare payment info (but do NOT create transaction yet)
          if (quest.monetaryReward && quest.track !== 'BOOTCAMP' && quest.source !== 'TUTORIAL') {
            paymentInfo = {
              questId: assignmentData.questId,
              userId: assignmentData.userId,
              track: quest.track,
              source: quest.source,
              monetaryReward: finalMonetaryReward,
            };
          }
        }

        return { alreadyProcessed: false as const, submission: updatedSubmission, rewardsPayload, paymentInfo };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );
    } catch (txError) {
      if (txError instanceof AlreadyProcessedError) {
        return NextResponse.json({ error: 'Submission already processed', success: false }, { status: 409 });
      }
      throw txError;
    }

    if (reviewResult.alreadyProcessed) {
      return NextResponse.json({ error: 'Submission already processed', success: false }, { status: 409 });
    }

    // Process XP and skills (outside transaction)
    if (reviewResult.rewardsPayload) {
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        reviewResult.rewardsPayload.userId,
        reviewResult.rewardsPayload.xpReward,
        reviewResult.rewardsPayload.skillPointsReward,
        assignmentData.questId
      );

      // Referral milestone check — award XP to the referrer if applicable
      const completionCount = await prisma.questCompletion.count({
        where: { userId: reviewResult.rewardsPayload.userId },
      });
      const { processReferralMilestone } = await import('@/lib/referral-utils');
      await processReferralMilestone(reviewResult.rewardsPayload.userId, completionCount);

      // Bootcamp tutorial tracking — matched by source enum, not fragile title string
      const { questTitle, questSource, userId: rewardUserId } = reviewResult.rewardsPayload;
      if (questSource === 'TUTORIAL') {
        const bootcampLink = await prisma.bootcampLink.findUnique({
          where: { userId: rewardUserId },
          select: { tutorialQuest1Complete: true, tutorialQuest2Complete: true },
        });
        if (bootcampLink) {
         const updateData: { tutorialQuest1Complete?: boolean; tutorialQuest2Complete?: boolean; eligibleForRealQuests?: boolean } = {};
          if (questTitle.startsWith('Tutorial: First Blood')) updateData.tutorialQuest1Complete = true;
          if (questTitle.startsWith('Tutorial: Party Up')) updateData.tutorialQuest2Complete = true;
          const tq1 = updateData.tutorialQuest1Complete ?? bootcampLink.tutorialQuest1Complete;
          const tq2 = updateData.tutorialQuest2Complete ?? bootcampLink.tutorialQuest2Complete;
          if (tq1 && tq2) updateData.eligibleForRealQuests = true;
          if (Object.keys(updateData).length > 0) {
            await prisma.bootcampLink.update({ where: { userId: rewardUserId }, data: updateData });
          }
        }
      }
    }

    // Payment is intentionally disconnected from the quest cycle.
    // When a quest is approved, create a PENDING transaction record so admin can
    // trigger payment manually later. Razorpay call is NOT made automatically.
    if (reviewResult.paymentInfo && reviewResult.paymentInfo.monetaryReward > 0) {
      await prisma.transaction.create({
        data: {
          toUserId: reviewResult.paymentInfo.userId,
          questId: reviewResult.paymentInfo.questId,
          amount: reviewResult.paymentInfo.monetaryReward * 0.85,
          platformFee: reviewResult.paymentInfo.monetaryReward * 0.15,
          platformFeeRate: 0.15,
          status: 'pending',
          paymentProvider: 'razorpay',
        },
      });
    }

    return NextResponse.json({ submission: reviewResult.submission, success: true });
  } catch (error) {
    console.error('Error updating quest submission:', error);
    return NextResponse.json({ error: 'Failed to update quest submission', success: false }, { status: 500 });
  }
}