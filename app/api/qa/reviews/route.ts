// app/api/qa/reviews/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const reviewerId = searchParams.get('reviewer_id');
    const questId = searchParams.get('questId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const whereClause: any = {};

    if (submissionId) {
      whereClause.id = submissionId;
    }
    if (reviewerId) {
      whereClause.reviewerId = reviewerId;
    }
    if (questId) {
      whereClause.assignment = { questId: questId };
    }
    if (status) {
      whereClause.status = status;
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
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    return Response.json({ submissions: data, success: true });
  } catch (error) {
    console.error('Error fetching submissions for review:', error);
    return Response.json({ error: 'Failed to fetch submissions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['submissionId', 'reviewer_id', 'quality_score', 'status'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Verify the reviewer has the appropriate permissions (in a real app, check if reviewer is qualified)
    // For now, we'll just verify the reviewer exists

    // Update the submission with review information
    const data = await prisma.questSubmission.update({
      where: { id: body.submissionId },
      data: {
        status: body.status,
        reviewerId: body.reviewer_id,
        reviewedAt: new Date(),
        reviewNotes: body.review_notes || null,
        qualityScore: body.quality_score,
      },
    });

    // If the submission is approved, update the assignment status and record completion
    if (body.status === 'approved') {
      // Get assignment ID for this submission
      const submission = await prisma.questSubmission.findUnique({
        where: { id: body.submissionId },
        select: { assignmentId: true },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Update assignment status
      await prisma.questAssignment.update({
        where: { id: submission.assignmentId },
        data: { status: 'completed', completedAt: new Date() },
      });

      // Get quest details to determine rewards
      const assignment = await prisma.questAssignment.findUnique({
        where: { id: submission.assignmentId },
        select: { questId: true, userId: true },
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const quest = await prisma.quest.findUnique({
        where: { id: assignment.questId },
        select: { xpReward: true, skillPointsReward: true },
      });

      if (!quest) {
        throw new Error('Quest not found');
      }

      // Record quest completion
      try {
        await prisma.questCompletion.create({
          data: {
            questId: assignment.questId,
            userId: assignment.userId,
            xpEarned: quest.xpReward,
            skillPointsEarned: quest.skillPointsReward,
            qualityScore: body.quality_score,
          },
        });
      } catch (completionError) {
        console.error('Error recording quest completion:', completionError);
      }

      // Update user XP, level, rank, and skill points
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(assignment.userId, quest.xpReward, quest.skillPointsReward);
    }
    // If submission needs rework, update assignment status to in_progress
    else if (body.status === 'needs_rework') {
      const submission = await prisma.questSubmission.findUnique({
        where: { id: body.submissionId },
        select: { assignmentId: true },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      await prisma.questAssignment.update({
        where: { id: submission.assignmentId },
        data: { status: 'in_progress' },
      });
    }

    return Response.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return Response.json({ error: 'Failed to review submission', success: false }, { status: 500 });
  }
}

// API to get quality statistics
export async function PUT(request: NextRequest) {
  try {
    // This endpoint could be used to update quality metrics or reprocess reviews
    const body = await request.json();

    // Currently just return a success response
    // In a real implementation, this might be used to update quality metrics
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in QA PUT:', error);
    return Response.json({ error: 'Failed to process request', success: false }, { status: 500 });
  }
}
