// lib/notification-utils.ts
import { prisma } from './db';
import { NotificationType } from '@prisma/client';

// Fetch notifications for a user
export async function fetchNotifications(
  userId: string,
  options: { type?: string; isRead?: boolean; limit?: number; offset?: number } = {}
) {
  const where: any = { userId };

  if (options.type) {
    where.type = options.type as NotificationType;
  }
  if (options.isRead !== undefined) {
    where.readAt = options.isRead ? { not: null } : null;
  }

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
    skip: options.offset,
  });
}

// Create a new notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: any
) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type as NotificationType,
      data: data || undefined,
    },
  });
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return true;
}

// Delete a notification
export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  await prisma.notification.delete({
    where: { id: notificationId, userId },
  });
  return true;
}

// Get unread count for a user
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

// Send a quest assignment notification
export async function sendQuestAssignmentNotification(userId: string, questTitle: string): Promise<void> {
  await createNotification(
    userId,
    'New Quest Assigned',
    `You've been assigned to "${questTitle}". Check your quest board to get started!`,
    'quest_assigned',
    { questTitle }
  );
}

// Send a quest completion notification
export async function sendQuestCompletionNotification(
  userId: string,
  questTitle: string,
  xpGained: number,
  spGained: number
): Promise<void> {
  await createNotification(
    userId,
    'Quest Completed!',
    `You've completed "${questTitle}" and earned ${xpGained} XP and ${spGained} SP!`,
    'quest_completed',
    { questTitle, xpGained, spGained }
  );
}

// Send a rank up notification
export async function sendRankUpNotification(userId: string, newRank: string): Promise<void> {
  await createNotification(
    userId,
    'Rank Up!',
    `Congratulations! You've been promoted to ${newRank}-Rank!`,
    'rank_up',
    { newRank }
  );
}

// Send a team invitation notification
export async function sendTeamInviteNotification(
  userId: string,
  teamName: string,
  inviterName: string
): Promise<void> {
  await createNotification(
    userId,
    'Team Invitation',
    `${inviterName} has invited you to join the team "${teamName}".`,
    'team_invite',
    { teamName, inviterName }
  );
}
