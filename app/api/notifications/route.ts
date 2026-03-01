import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (userId !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { notification_id, userId, is_read } = body;

    if (userId !== session.user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await prisma.notification.update({
      where: { id: notification_id },
      data: { readAt: is_read ? new Date() : null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}