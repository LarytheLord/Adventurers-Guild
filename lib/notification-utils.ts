// lib/notification-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

// Fetch notifications for a user
export async function fetchNotifications(
  userId: string, 
  options: { 
    type?: string; 
    isRead?: boolean; 
    limit?: number; 
    offset?: number 
  } = {}
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.type) {
    query = query.eq('type', options.type);
  }
  if (options.isRead !== undefined) {
    if (options.isRead) {
      query = query.not('read_at', 'is', null);
    } else {
      query = query.is('read_at', null);
    }
  }
  if (options.limit) {
    query = query.limit(options.limit);
    if (options.offset) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }

  return data;
}

// Create a new notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: any
): Promise<Notification | null> {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      title,
      message,
      type,
      data: data || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }

  return notification;
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }

  return data;
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }

  return true;
}

// Delete a notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }

  return true;
}

// Get unread count for a user
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('Error getting unread notification count:', error);
    throw new Error('Failed to get unread notification count');
  }

  return count || 0;
}

// Send a quest assignment notification
export async function sendQuestAssignmentNotification(
  userId: string,
  questTitle: string
): Promise<void> {
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
export async function sendRankUpNotification(
  userId: string,
  newRank: string
): Promise<void> {
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