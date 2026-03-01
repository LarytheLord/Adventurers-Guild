// app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    // Users can only see their own notifications
    const userId = authUser.id;
    const type = searchParams.get('type');
    const isRead = searchParams.get('is_read');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const where: Record<string, unknown> = {
      userId,
    };

    if (type) {
      where.type = type;
    }
    if (isRead !== null) {
      if (isRead === 'true') {
        where.readAt = { not: null };
      } else if (isRead === 'false') {
        where.readAt = null;
      }
    }

    const data = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ notifications: data, success: true });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['userId', 'title', 'message', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Create the notification
    const data = await prisma.notification.create({
      data: {
        userId: body.userId,
        title: body.title,
        message: body.message,
        type: body.type,
        data: body.data || null,
      },
    });

    return Response.json({ notification: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: 'Failed to create notification', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id, is_read } = body;
    const userId = authUser.id;

    // Validate required fields
    if (!notification_id || !userId) {
      return Response.json({ error: 'Notification ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notification_id },
      select: { userId: true },
    });

    if (!notification) {
      return Response.json({ error: 'Notification not found', success: false }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Update the notification
    const data = await prisma.notification.update({
      where: { id: notification_id },
      data: {
        readAt: is_read ? new Date() : null,
      },
    });

    return Response.json({ notification: data, success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return Response.json({ error: 'Failed to update notification', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id } = body;
    const userId = authUser.id;

    // Validate required fields
    if (!notification_id || !userId) {
      return Response.json({ error: 'Notification ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notification_id },
      select: { userId: true },
    });

    if (!notification) {
      return Response.json({ error: 'Notification not found', success: false }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: notification_id },
    });

    return Response.json({ message: 'Notification deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return Response.json({ error: 'Failed to delete notification', success: false }, { status: 500 });
  }
}

// API to mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const userId = authUser.id;

    // Mark all notifications for user as read
    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return Response.json({ message: 'All notifications marked as read', success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return Response.json({ error: 'Failed to mark notifications as read', success: false }, { status: 500 });
  }
}
