// app/api/quests/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus, SubmissionStatus } from '@prisma/client';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';
import { clampPaginationValue, questSubmissionCreateSchema } from '@/lib/validation/schemas';

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
    const limit = clampPaginationValue(searchParams.get('limit'), { fallback: 10, min: 1, max: 100 });
    const offset = clampPaginationValue(searchParams.get('offset'), { fallback: 0, min: 0, max: 10_000 });

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
      if (!Object.values(SubmissionStatus).includes(status as SubmissionStatus)) {
        return NextResponse.json({ error: 'Invalid submission status', success: false }, { status: 400 });
      }
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
      skip: offset,
      take: limit,
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
    const parsedBody = questSubmissionCreateSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedBody.error.flatten(), success: false },
        { status: 400 }
      );
    }
    const { assignmentId, submissionContent, submissionNotes } = parsedBody.data;
    const userId = user.id; // Use authenticated user's ID

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

    if (!['assigned', 'started', 'in_progress', 'needs_rework'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Invalid assignment state for submission', success: false }, { status: 400 });
    }

    // BOOTCAMP and INTERN quests go to pending_admin_review (Open Paws QA gate)
    // OPEN track goes directly to submitted (client sees immediately)
    const postSubmitStatus =
      assignment.quest.track !== 'OPEN' ? 'pending_admin_review' : 'submitted';

    const data = await prisma.$transaction(
      async (tx) => {
        const assignmentTransition = await tx.questAssignment.updateMany({
          where: {
            id: assignmentId,
            userId: assignment.userId,
            status: { in: ['assigned', 'started', 'in_progress', 'needs_rework'] },
          },
          data: { status: postSubmitStatus },
        });

        if (assignmentTransition.count === 0) {
          throw new Error('This assignment is no longer ready for submission. Please refresh and try again.');
        }

        const submission = await tx.questSubmission.create({
          data: {
            assignmentId: assignmentId,
            userId,
            submissionContent,
            submissionNotes: submissionNotes ?? null,
          },
        });

        await syncQuestLifecycleStatus(tx, assignment.questId);
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
    const { submissionId, status, review_notes, quality_score } = body;
    const reviewerId = user.id; // Use authenticated user's ID

    // Validate required fields
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this submission
    // Only admins, or company users for their own quests can review submissions
    // First get the submission
    const submission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, assignmentId: true, status: true },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    // Then get the assignment to check quest details
    const assignmentData = await prisma.questAssignment.findUnique({
      where: { id: submission.assignmentId },
      select: {
        questId: true,
        userId: true,
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

    // Check permissions
    if (user.role !== 'admin' &&
        (user.role !== 'company' || !assignmentData.quest || assignmentData.quest.companyId !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized to review this submission', success: false }, { status: 403 });
    }

    const wasAlreadyApproved = submission.status === 'approved';

    const reviewResult = await prisma.$transaction(
      async (tx) => {
        const updatedSubmission = await tx.questSubmission.update({
          where: { id: submissionId },
          data: {
            status,
            reviewNotes: review_notes || undefined,
            qualityScore: quality_score || undefined,
            reviewerId,
            reviewedAt: status !== 'pending' ? new Date() : undefined,
          },
        });

        let newAssignmentStatus: AssignmentStatus | null = null;
        if (status === 'approved') {
          newAssignmentStatus = 'completed';
        } else if (status === 'needs_rework' || status === 'rejected') {
          newAssignmentStatus = 'in_progress';
        }

        if (newAssignmentStatus) {
          await tx.questAssignment.update({
            where: { id: submission.assignmentId },
            data: {
              status: newAssignmentStatus,
              ...(newAssignmentStatus === 'completed' ? { completedAt: new Date() } : {}),
            },
          });
        }

        await syncQuestLifecycleStatus(tx, assignmentData.questId);

        let rewardsPayload: { userId: string; xpReward: number; skillPointsReward: number; questTitle: string } | null = null;
        if (status === 'approved' && !wasAlreadyApproved) {
          const quest = await tx.quest.findUnique({
            where: { id: assignmentData.questId },
            select: { xpReward: true, skillPointsReward: true },
          });

          if (!quest) {
            throw new Error('Quest not found for completion recording');
          }

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
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore: quality_score || null,
            },
            update: {
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore: quality_score || null,
            },
          });

          rewardsPayload = {
            userId: assignmentData.userId,
            xpReward: quest.xpReward,
            skillPointsReward: quest.skillPointsReward,
            questTitle: assignmentData.quest?.title ?? '',
          };
        }

        return { submission: updatedSubmission, rewardsPayload };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    if (reviewResult.rewardsPayload) {
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        reviewResult.rewardsPayload.userId,
        reviewResult.rewardsPayload.xpReward,
        reviewResult.rewardsPayload.skillPointsReward
      );

      // Task 1.4: Tutorial quest completion tracking for bootcamp students
      const { questTitle, userId: rewardUserId } = reviewResult.rewardsPayload;
      if (questTitle.startsWith('Tutorial:')) {
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

    return NextResponse.json({ submission: reviewResult.submission, success: true });
  } catch (error) {
    console.error('Error updating quest submission:', error);
    return NextResponse.json({ error: 'Failed to update quest submission', success: false }, { status: 500 });
  }
}
