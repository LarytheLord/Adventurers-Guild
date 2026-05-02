import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

const MAX_NOTIFICATION_LIMIT = 50;

function getRequestedUserId(input: unknown, fallbackUserId: string) {
  return typeof input === 'string' && input.trim() ? input.trim() : fallbackUserId;
}

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = getRequestedUserId(searchParams.get('userId'), authUser.id);
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '10', 10);

  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return NextResponse.json({ success: false, error: 'limit must be a positive integer' }, { status: 400 });
  }

  if (userId !== authUser.id && authUser.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const limit = Math.min(parsedLimit, MAX_NOTIFICATION_LIMIT);

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const notificationId =
      typeof body.notificationId === 'string'
        ? body.notificationId
        : typeof body.notification_id === 'string'
          ? body.notification_id
          : '';
    const userId = getRequestedUserId(body.userId, authUser.id);
    const isRead = typeof body.isRead === 'boolean' ? body.isRead : Boolean(body.is_read);

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'notificationId is required' }, { status: 400 });
    }

    if (userId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: isRead ? new Date() : null },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = getRequestedUserId(body.userId, authUser.id);

    if (userId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true, updatedCount: result.count });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const notificationId =
      typeof body.notificationId === 'string'
        ? body.notificationId
        : typeof body.notification_id === 'string'
          ? body.notification_id
          : '';
    const userId = getRequestedUserId(body.userId, authUser.id);

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'notificationId is required' }, { status: 400 });
    }

    if (userId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
