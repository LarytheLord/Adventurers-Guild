import { prisma } from '@/lib/db';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
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
        read_at: null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}