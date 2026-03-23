import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';

const VALID_REVIEW_STATUSES = ['pending', 'under_review', 'approved', 'needs_rework', 'rejected'] as const;
type ReviewStatus = (typeof VALID_REVIEW_STATUSES)[number];

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const reviewerId = searchParams.get('reviewer_id');
    const questId = searchParams.get('questId');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') ?? '10', 10) || 10;
    const offset = Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    if (reviewerId && authUser.role !== 'admin' && reviewerId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
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

    return Response.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching submissions for review:', error);
    return Response.json({ error: 'Failed to fetch submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const requiredFields = ['submissionId', 'quality_score', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
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
      return Response.json(
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
      return Response.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && existingSubmission.assignment.quest?.companyId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    const data = await prisma.questSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewerId: authUser.id,
        reviewedAt: new Date(),
        reviewNotes: typeof body.review_notes === 'string' ? body.review_notes : null,
        qualityScore,
      },
    });

    const wasAlreadyApproved = existingSubmission.status === 'approved';

    if (status === 'approved' && !wasAlreadyApproved) {
      await prisma.questAssignment.update({
        where: { id: existingSubmission.assignmentId },
        data: { status: 'completed', completedAt: new Date() },
      });

      const quest = await prisma.quest.findUnique({
        where: { id: existingSubmission.assignment.questId },
        select: { xpReward: true, skillPointsReward: true },
      });

      if (!quest) {
        throw new Error('Quest not found');
      }

      // Record quest completion
      try {
        await prisma.questCompletion.create({
          data: {
            questId: existingSubmission.assignment.questId,
            userId: existingSubmission.assignment.userId,
            xpEarned: quest.xpReward,
            skillPointsEarned: quest.skillPointsReward,
            qualityScore,
          },
        });
      } catch (completionError) {
        console.error('Error recording quest completion:', completionError);
      }

      // Update user XP, level, rank, and skill points
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        existingSubmission.assignment.userId,
        quest.xpReward,
        quest.skillPointsReward
      );
    }
    else if (status === 'needs_rework' || status === 'rejected') {
      await prisma.questAssignment.update({
        where: { id: existingSubmission.assignmentId },
        data: { status: 'in_progress' },
      });
    }

    await syncQuestLifecycleStatus(prisma, existingSubmission.assignment.questId);

    return Response.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return Response.json({ error: 'Failed to review submission', success: false }, { status: 500 });
  }
}

// API to get quality statistics
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    await request.json();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in QA PUT:', error);
    return Response.json({ error: 'Failed to process request', success: false }, { status: 500 });
  }
}
