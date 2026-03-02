import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any = {}
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data,
        readAt: null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}