// app/api/quests/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const questId = searchParams.get('questId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

    // Build where clause based on permissions
    const where: any = {};

    if (currentUserRole === 'adventurer') {
      // Adventurers can only see their own assignments
      where.userId = currentUserId;
    } else if (currentUserRole === 'company') {
      // Companies can see assignments for their quests
      const companyQuests = await prisma.quest.findMany({
        where: { companyId: currentUserId },
        select: { id: true },
      });

      const questIds = companyQuests.map((q) => q.id);
      where.questId = { in: questIds };
    } else if (currentUserRole === 'admin') {
      // Admins can see all assignments - no additional filter needed
    } else {
      // Other roles are not allowed
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Add filters if provided (respecting permissions)
    if (requestedUserId && currentUserRole === 'admin') {
      // Only admins can request assignments for a specific user
      where.userId = requestedUserId;
    }
    if (questId) {
      where.questId = questId;
    }
    if (status) {
      where.status = status;
    }

    const assignments = await prisma.questAssignment.findMany({
      where,
      include: {
        quest: {
          select: {
            title: true,
            description: true,
            questType: true,
            status: true,
            difficulty: true,
            xpReward: true,
            skillPointsReward: true,
            requiredSkills: true,
            requiredRank: true,
            questCategory: true,
            deadline: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({ assignments, success: true });
  } catch (error) {
    console.error('Error fetching quest assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch quest assignments', success: false }, { status: 500 });
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
    const { questId } = body;
    const userId = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!questId) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the quest exists and is available
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { status: true, maxParticipants: true },
    });

    if (!quest || quest.status !== 'available') {
      return NextResponse.json({ error: 'Quest not available', success: false }, { status: 400 });
    }

    // Check if the max number of participants has been reached
    if (quest.maxParticipants) {
      const count = await prisma.questAssignment.count({
        where: {
          questId: questId,
          status: { not: 'cancelled' },
        },
      });

      if (count >= quest.maxParticipants) {
        return NextResponse.json({ error: 'Maximum participants reached for this quest', success: false }, { status: 400 });
      }
    }

    // Check if user is already assigned to this quest
    const existingAssignment = await prisma.questAssignment.findFirst({
      where: {
        questId: questId,
        userId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json({ error: 'You are already assigned to this quest', success: false }, { status: 400 });
    }

    // Create the assignment
    const assignment = await prisma.questAssignment.create({
      data: {
        questId: questId,
        userId,
        status: 'assigned',
      },
    });

    // Update the quest status to 'in_progress' if it's the first assignment
    if (quest.maxParticipants === 1 || !quest.maxParticipants) {
      await prisma.quest.update({
        where: { id: questId },
        data: { status: 'in_progress' },
      });
    }

    return NextResponse.json({ assignment, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest assignment:', error);
    return NextResponse.json({ error: 'Failed to create quest assignment', success: false }, { status: 500 });
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
    const { assignmentId, status, progress } = body;
    const userId = session.user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignmentId || !status) {
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
    }

    // Check if the user has permission to update this assignment
    // Only the assigned user or an admin can update the assignment
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { userId: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    if (assignment.userId !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to update this assignment', success: false }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, any> = { status };
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    if (status === 'started') {
      updateData.startedAt = new Date();
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    // Update the assignment
    const updatedAssignment = await prisma.questAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    return NextResponse.json({ assignment: updatedAssignment, success: true });
  } catch (error) {
    console.error('Error updating quest assignment:', error);
    return NextResponse.json({ error: 'Failed to update quest assignment', success: false }, { status: 500 });
  }
}
