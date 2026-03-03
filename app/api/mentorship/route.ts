// app/api/mentorship/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'mentor' or 'mentee'
    const status = searchParams.get('status'); // 'active', 'pending', 'completed', 'cancelled'
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build where clause based on role
    const whereClause: Record<string, unknown> = {};

    if (role === 'mentor') {
      whereClause.mentorId = userId;
    } else if (role === 'mentee') {
      whereClause.menteeId = userId;
    } else {
      // If no role specified, show relationships where user is either mentor or mentee
      whereClause.OR = [
        { mentorId: userId },
        { menteeId: userId },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const data = await prisma.mentorship.findMany({
      where: whereClause,
      select: {
        id: true,
        mentorId: true,
        menteeId: true,
        status: true,
        startDate: true,
        endDate: true,
        goals: true,
        progress: true,
        createdAt: true,
        updatedAt: true,
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            xp: true,
            skillPoints: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            xp: true,
            skillPoints: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    return Response.json({ mentorships: data, success: true });
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    return Response.json({ error: 'Failed to fetch mentorships', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['mentorId', 'menteeId', 'goals'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Check if users exist and validate roles
    const mentor = await prisma.user.findUnique({
      where: { id: body.mentorId },
      select: { id: true, name: true, role: true, rank: true, xp: true },
    });

    if (!mentor || mentor.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentor user', success: false }, { status: 400 });
    }

    const mentee = await prisma.user.findUnique({
      where: { id: body.menteeId },
      select: { id: true, name: true, role: true, rank: true, xp: true },
    });

    if (!mentee || mentee.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentee user', success: false }, { status: 400 });
    }

    // Check if a mentorship already exists between these users
    const existingMentorship = await prisma.mentorship.findMany({
      where: {
        OR: [
          { mentorId: body.mentorId, menteeId: body.menteeId },
          { mentorId: body.menteeId, menteeId: body.mentorId },
        ],
        status: { in: ['active', 'pending'] },
      },
      select: { id: true },
    });

    if (existingMentorship && existingMentorship.length > 0) {
      return Response.json({
        error: 'A mentorship already exists between these users',
        success: false
      }, { status: 400 });
    }

    // Create the mentorship request
    const data = await prisma.mentorship.create({
      data: {
        mentorId: body.mentorId,
        menteeId: body.menteeId,
        goals: body.goals,
        status: 'pending', // Start as pending for mentee approval
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        progress: 0,
      },
    });

    // Send notification to mentee about the mentorship request
    try {
      await prisma.notification.create({
        data: {
          userId: body.menteeId,
          title: 'Mentorship Request',
          message: `${mentor.name} has requested to be your mentor. Review the request in your mentorship dashboard.`,
          type: 'mentorship_request',
          data: {
            mentorId: body.mentorId,
            mentorName: mentor.name,
            mentorshipId: data.id,
          },
        },
      });
    } catch (notificationError) {
      console.error('Error sending mentorship request notification:', notificationError);
    }

    return Response.json({ mentorship: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentorship:', error);
    return Response.json({ error: 'Failed to create mentorship', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorshipId, current_userId, action, ...updateFields } = body;

    // Validate required fields
    if (!mentorshipId || !current_userId) {
      return Response.json({ error: 'Mentorship ID and User ID are required', success: false }, { status: 400 });
    }

    // Get current mentorship
    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { mentorId: true, menteeId: true, status: true },
    });

    if (!mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    // Check permissions based on action
    let canUpdate = false;
    if (action === 'approve') {
      // Only mentee can approve a pending request
      canUpdate = current_userId === mentorship.menteeId && mentorship.status === 'pending';
    } else if (action === 'reject') {
      // Only mentee can reject a pending request
      canUpdate = current_userId === mentorship.menteeId && mentorship.status === 'pending';
    } else if (action === 'complete') {
      // Either mentor or mentee can complete an active mentorship
      canUpdate = (current_userId === mentorship.mentorId || current_userId === mentorship.menteeId) &&
                  mentorship.status === 'active';
    } else if (action === 'terminate') {
      // Either mentor or mentee can terminate an active mentorship
      canUpdate = (current_userId === mentorship.mentorId || current_userId === mentorship.menteeId) &&
                  mentorship.status === 'active';
    } else {
      // For general updates, only the mentor or mentee can update
      canUpdate = current_userId === mentorship.mentorId || current_userId === mentorship.menteeId;
    }

    if (!canUpdate) {
      return Response.json({ error: 'Unauthorized to perform this action', success: false }, { status: 403 });
    }

    // Prepare the update based on action
    let updateData: Record<string, unknown> = {};

    if (action === 'approve') {
      updateData = { status: 'active', startDate: new Date() };
    } else if (action === 'reject') {
      updateData = { status: 'cancelled' };
    } else if (action === 'complete') {
      updateData = { status: 'completed', endDate: new Date() };
    } else if (action === 'terminate') {
      updateData = { status: 'cancelled', endDate: new Date() };
    } else {
      // General updates
      updateData = updateFields;
    }

    // Update the mentorship
    const data = await prisma.mentorship.update({
      where: { id: mentorshipId },
      data: updateData,
    });

    // If approving, notify the mentor
    if (action === 'approve') {
      // Fetch mentee name for notification
      const menteeData = await prisma.user.findUnique({
        where: { id: mentorship.menteeId },
        select: { name: true },
      });

      try {
        await prisma.notification.create({
          data: {
            userId: mentorship.mentorId,
            title: 'Mentorship Approved',
            message: `${menteeData?.name || 'A user'} has approved your mentorship request.`,
            type: 'mentorship_approved',
            data: {
              menteeId: mentorship.menteeId,
              menteeName: menteeData?.name,
              mentorshipId: data.id,
            },
          },
        });
      } catch (notificationError) {
        console.error('Error sending mentorship approval notification:', notificationError);
      }
    }

    return Response.json({ mentorship: data, success: true });
  } catch (error) {
    console.error('Error updating mentorship:', error);
    return Response.json({ error: 'Failed to update mentorship', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorshipId, current_userId } = body;

    // Validate required fields
    if (!mentorshipId || !current_userId) {
      return Response.json({ error: 'Mentorship ID and User ID are required', success: false }, { status: 400 });
    }

    // Get current mentorship
    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { mentorId: true, menteeId: true, status: true },
    });

    if (!mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    // Only allow deletion for cancelled or completed mentorships
    if (mentorship.status !== 'cancelled' && mentorship.status !== 'completed') {
      return Response.json({
        error: 'Can only delete cancelled or completed mentorships',
        success: false
      }, { status: 400 });
    }

    // Check if current user is part of the mentorship
    if (current_userId !== mentorship.mentorId && current_userId !== mentorship.menteeId) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Delete the mentorship
    await prisma.mentorship.delete({
      where: { id: mentorshipId },
    });

    return Response.json({ message: 'Mentorship deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    return Response.json({ error: 'Failed to delete mentorship', success: false }, { status: 500 });
  }
}
