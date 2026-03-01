// app/api/quests/submissions/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
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

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

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
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assignmentId, submissionContent, submissionNotes } = body;
    const userId = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignmentId || !submissionContent) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the assignment exists and belongs to the current user
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { status: true, userId: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Only the assigned user can submit
    if (assignment.userId !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to submit for this assignment', success: false }, { status: 403 });
    }

    if (!['assigned', 'started', 'in_progress'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Invalid assignment state for submission', success: false }, { status: 400 });
    }

    // Create the submission
    const data = await prisma.questSubmission.create({
      data: {
        assignmentId: assignmentId,
        userId,
        submissionContent: submissionContent,
        submissionNotes: submissionNotes || null,
      },
    });

    // Update assignment status to submitted
    await prisma.questAssignment.update({
      where: { id: assignmentId },
      data: { status: 'submitted' },
    });

    return NextResponse.json({ submission: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest submission:', error);
    return NextResponse.json({ error: 'Failed to create quest submission', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { submissionId, status, review_notes, quality_score } = body;
    const reviewerId = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this submission
    // Only admins, or company users for their own quests can review submissions
    // First get the submission
    const submission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, assignmentId: true },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found', success: false }, { status: 404 });
    }

    // Then get the assignment to check quest details
    const assignmentData = await prisma.questAssignment.findUnique({
      where: { id: submission.assignmentId },
      select: {
        questId: true,
        quest: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!assignmentData) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== 'admin' &&
        (session.user.role !== 'company' || !assignmentData.quest || assignmentData.quest.companyId !== session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized to review this submission', success: false }, { status: 403 });
    }

    // Update the submission
    const data = await prisma.questSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewNotes: review_notes || undefined,
        qualityScore: quality_score || undefined,
        reviewerId,
        reviewedAt: status !== 'pending' ? new Date() : undefined,
      },
    });

    // Update assignment status based on submission status
    let newAssignmentStatus = '';
    if (status === 'approved') {
      newAssignmentStatus = 'completed';
    } else if (status === 'needs_rework' || status === 'rejected') {
      newAssignmentStatus = 'in_progress'; // Allow rework
    }

    if (newAssignmentStatus) {
      await prisma.questAssignment.update({
        where: { id: submission.assignmentId },
        data: { status: newAssignmentStatus as any },
      });
    }

    // If the submission was approved, record the quest completion
    if (status === 'approved' && data.assignmentId) {
      // Get assignment details to get the quest and user IDs
      const approvedAssignment = await prisma.questAssignment.findUnique({
        where: { id: data.assignmentId },
        select: { questId: true, userId: true },
      });

      if (!approvedAssignment) {
        throw new Error('Assignment not found for completion recording');
      }

      // Get quest details to get the rewards
      const quest = await prisma.quest.findUnique({
        where: { id: approvedAssignment.questId },
        select: { xpReward: true, skillPointsReward: true },
      });

      if (!quest) {
        throw new Error('Quest not found for completion recording');
      }

      // Record the quest completion
      try {
        await prisma.questCompletion.create({
          data: {
            questId: approvedAssignment.questId,
            userId: approvedAssignment.userId,
            xpEarned: quest.xpReward,
            skillPointsEarned: quest.skillPointsReward,
            qualityScore: quality_score || null,
          },
        });
      } catch (completionError) {
        console.error('Error recording quest completion:', completionError);
      }

      // Update user XP, level, rank, and skill points
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(approvedAssignment.userId, quest.xpReward, quest.skillPointsReward);
    }

    return NextResponse.json({ submission: data, success: true });
  } catch (error) {
    console.error('Error updating quest submission:', error);
    return NextResponse.json({ error: 'Failed to update quest submission', success: false }, { status: 500 });
  }
}
