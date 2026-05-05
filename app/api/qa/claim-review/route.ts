import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { RANK_THRESHOLDS } from '@/lib/ranks';

const B_RANK_THRESHOLD = RANK_THRESHOLDS.find(({ rank }) => rank === 'B')?.threshold ?? 10000;

// POST /api/qa/claim-review — B-rank+ adventurer claims a submission for peer review
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'adventurer');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { xp: true },
    });

    if (!reviewer || reviewer.xp < B_RANK_THRESHOLD) {
      return NextResponse.json(
        { error: 'Must be B-rank or above to claim reviews', success: false },
        { status: 403 }
      );
    }

    const body = await request.json();
    const submissionId = body.submissionId as string;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId is required', success: false },
        { status: 400 }
      );
    }

    const submission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            userId: true,
            status: true,
            quest: {
              select: {
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    if (submission.status !== 'pending' || submission.assignment.status !== 'pending_admin_review') {
      return NextResponse.json(
        { error: 'Submission is not available for peer review', success: false },
        { status: 400 }
      );
    }

    if (submission.reviewerId && submission.reviewerId !== authUser.id) {
      return NextResponse.json(
        { error: 'This submission has already been claimed by another reviewer', success: false },
        { status: 409 }
      );
    }

    if (submission.userId === authUser.id) {
      return NextResponse.json(
        { error: 'Cannot review your own submission', success: false },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.questSubmission.update({
      where: { id: submissionId },
      data: {
        reviewerId: authUser.id,
        status: 'under_review',
      },
    });

    return NextResponse.json({
      submission: updatedSubmission,
      success: true,
    });
  } catch (error) {
    console.error('Error claiming review:', error);
    return NextResponse.json(
      { error: 'Failed to claim review', success: false },
      { status: 500 }
    );
  }
}
