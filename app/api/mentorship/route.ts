import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

const MAX_LIMIT = 50;
const VALID_STATUSES = ['active', 'pending', 'completed', 'cancelled'] as const;
const VALID_ACTIONS = ['approve', 'reject', 'complete', 'terminate'] as const;

type MentorshipStatus = (typeof VALID_STATUSES)[number];
type MentorshipAction = (typeof VALID_ACTIONS)[number];

function toSafeInt(rawValue: string | null, fallback: number, min = 0, max = MAX_LIMIT) {
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseDate(value: unknown) {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseGoals(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((goal) => goal.trim())
    .filter((goal) => goal.length > 0);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const role = searchParams.get('role'); // mentor | mentee
    const status = searchParams.get('status');
    const limit = toSafeInt(searchParams.get('limit'), 10, 1, MAX_LIMIT);
    const offset = toSafeInt(searchParams.get('offset'), 0, 0, 10000);

    if (requestedUserId && authUser.role !== 'admin' && requestedUserId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    if (role && role !== 'mentor' && role !== 'mentee') {
      return Response.json({ error: 'Invalid role filter', success: false }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status as MentorshipStatus)) {
      return Response.json({ error: 'Invalid status filter', success: false }, { status: 400 });
    }

    const targetUserId =
      authUser.role === 'admin' && requestedUserId ? requestedUserId : authUser.id;

    const whereClause: Record<string, unknown> = {};

    if (role === 'mentor') {
      whereClause.mentorId = targetUserId;
    } else if (role === 'mentee') {
      whereClause.menteeId = targetUserId;
    } else {
      whereClause.OR = [{ mentorId: targetUserId }, { menteeId: targetUserId }];
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
      skip: offset,
      take: limit,
    });

    return Response.json({ mentorships: data, success: true });
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    return Response.json({ error: 'Failed to fetch mentorships', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const mentorId = typeof body.mentorId === 'string' ? body.mentorId : '';
    const menteeId = typeof body.menteeId === 'string' ? body.menteeId : '';
    const goals = parseGoals(body.goals);

    if (!mentorId || !menteeId) {
      return Response.json(
        { error: 'mentorId and menteeId are required', success: false },
        { status: 400 }
      );
    }
    if (mentorId === menteeId) {
      return Response.json(
        { error: 'Mentor and mentee must be different users', success: false },
        { status: 400 }
      );
    }
    if (goals.length === 0) {
      return Response.json({ error: 'At least one goal is required', success: false }, { status: 400 });
    }
    if (authUser.role !== 'admin' && authUser.id !== mentorId && authUser.id !== menteeId) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, name: true, role: true },
    });
    if (!mentor || mentor.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentor user', success: false }, { status: 400 });
    }

    const mentee = await prisma.user.findUnique({
      where: { id: menteeId },
      select: { id: true, role: true },
    });
    if (!mentee || mentee.role !== 'adventurer') {
      return Response.json({ error: 'Invalid mentee user', success: false }, { status: 400 });
    }

    const existingMentorship = await prisma.mentorship.findMany({
      where: {
        OR: [
          { mentorId, menteeId },
          { mentorId: menteeId, menteeId: mentorId },
        ],
        status: { in: ['active', 'pending'] },
      },
      select: { id: true },
    });

    if (existingMentorship.length > 0) {
      return Response.json(
        { error: 'A mentorship already exists between these users', success: false },
        { status: 400 }
      );
    }

    const startDate = parseDate(body.startDate) ?? new Date();
    const endDate = body.endDate === null ? null : parseDate(body.endDate);
    if (body.endDate && !endDate) {
      return Response.json({ error: 'Invalid endDate', success: false }, { status: 400 });
    }

    const data = await prisma.mentorship.create({
      data: {
        mentorId,
        menteeId,
        goals,
        status: 'pending',
        startDate,
        endDate,
        progress: 0,
      },
    });

    try {
      await prisma.notification.create({
        data: {
          userId: menteeId,
          title: 'Mentorship Request',
          message: `${mentor.name ?? 'A user'} has requested to be your mentor. Review the request in your mentorship dashboard.`,
          type: 'mentorship_request',
          data: {
            mentorId,
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
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const mentorshipId = typeof body.mentorshipId === 'string' ? body.mentorshipId : '';
    const action =
      typeof body.action === 'string' && VALID_ACTIONS.includes(body.action as MentorshipAction)
        ? (body.action as MentorshipAction)
        : null;

    if (!mentorshipId) {
      return Response.json({ error: 'Mentorship ID is required', success: false }, { status: 400 });
    }

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { mentorId: true, menteeId: true, status: true },
    });

    if (!mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    const currentUserId = authUser.id;
    let canUpdate = authUser.role === 'admin';
    if (!canUpdate) {
      if (action === 'approve' || action === 'reject') {
        canUpdate = currentUserId === mentorship.menteeId && mentorship.status === 'pending';
      } else if (action === 'complete' || action === 'terminate') {
        canUpdate =
          (currentUserId === mentorship.mentorId || currentUserId === mentorship.menteeId) &&
          mentorship.status === 'active';
      } else {
        canUpdate = currentUserId === mentorship.mentorId || currentUserId === mentorship.menteeId;
      }
    }

    if (!canUpdate) {
      return Response.json(
        { error: 'Unauthorized to perform this action', success: false },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (action === 'approve') {
      updateData.status = 'active';
      updateData.startDate = new Date();
    } else if (action === 'reject') {
      updateData.status = 'cancelled';
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.endDate = new Date();
    } else if (action === 'terminate') {
      updateData.status = 'cancelled';
      updateData.endDate = new Date();
    } else {
      const goals = parseGoals(body.goals);
      if (goals.length > 0) {
        updateData.goals = goals;
      }

      if (typeof body.progress === 'number') {
        updateData.progress = Math.min(Math.max(body.progress, 0), 100);
      }

      if (body.endDate === null) {
        updateData.endDate = null;
      } else if (body.endDate !== undefined) {
        const parsedEndDate = parseDate(body.endDate);
        if (!parsedEndDate) {
          return Response.json({ error: 'Invalid endDate', success: false }, { status: 400 });
        }
        updateData.endDate = parsedEndDate;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    const data = await prisma.mentorship.update({
      where: { id: mentorshipId },
      data: updateData,
    });

    if (action === 'approve') {
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
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const mentorshipId = typeof body.mentorshipId === 'string' ? body.mentorshipId : '';
    if (!mentorshipId) {
      return Response.json({ error: 'Mentorship ID is required', success: false }, { status: 400 });
    }

    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      select: { mentorId: true, menteeId: true, status: true },
    });

    if (!mentorship) {
      return Response.json({ error: 'Mentorship not found', success: false }, { status: 404 });
    }

    const isParticipant = authUser.id === mentorship.mentorId || authUser.id === mentorship.menteeId;
    if (authUser.role !== 'admin' && !isParticipant) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    if (
      authUser.role !== 'admin' &&
      mentorship.status !== 'cancelled' &&
      mentorship.status !== 'completed'
    ) {
      return Response.json(
        { error: 'Can only delete cancelled or completed mentorships', success: false },
        { status: 400 }
      );
    }

    await prisma.mentorship.delete({
      where: { id: mentorshipId },
    });

    return Response.json({ message: 'Mentorship deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    return Response.json({ error: 'Failed to delete mentorship', success: false }, { status: 500 });
  }
}
