import { supabase } from './supabase'
import { createSupabaseServerClient } from './supabase/server'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'quest' | 'payment' | 'achievement' | 'system' | 'announcement' | 'moderation' | 'admin_action'
  data?: any
  isRead: boolean
  createdAt: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface NotificationPreferences {
  email: {
    questUpdates: boolean
    paymentNotifications: boolean
    achievements: boolean
    systemAnnouncements: boolean
    weeklyDigest: boolean
  }
  push: {
    questUpdates: boolean
    paymentNotifications: boolean
    achievements: boolean
    systemAnnouncements: boolean
  }
  inApp: {
    all: boolean
  }
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    data?: any,
    priority: Notification['priority'] = 'medium'
  ): Promise<{ success: boolean; notification?: Notification }> {
    try {
      const notification = {
        user_id: userId,
        title,
        message,
        type,
        data: data || {},
        priority,
        action_url: this.generateActionUrl(type, data),
        created_at: new Date().toISOString()
      }

      const { data: created, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single()

      if (error) throw error

      // Send real-time notification
      await this.sendRealtimeNotification(userId, created)

      // Check if user wants email notifications
      await this.checkAndSendEmailNotification(userId, created)

      return {
        success: true,
        notification: this.formatNotification(created)
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { success: false }
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: Notification['type']
    } = {}
  ): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
  }> {
    try {
      const { limit = 20, offset = 0, unreadOnly = false, type } = options

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (type) {
        query = query.eq('type', type)
      }

      const { data: notifications, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Get unread count separately
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      return {
        notifications: notifications?.map(this.formatNotification) || [],
        total: count || 0,
        unreadCount: unreadCount || 0
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { notifications: [], total: 0, unreadCount: 0 }
    }
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(
    userId: string,
    notificationIds: string[]
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('id', notificationIds)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      return { success: false }
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false }
    }
  }

  /**
   * Delete notifications
   */
  static async deleteNotifications(
    userId: string,
    notificationIds: string[]
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .in('id', notificationIds)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting notifications:', error)
      return { success: false }
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = this.formatNotification(payload.new)
          callback(notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Get user notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data?.preferences || this.getDefaultPreferences()
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return this.getDefaultPreferences()
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return { success: false }
    }
  }

  /**
   * Send quest-related notifications
   */
  static async notifyQuestUpdate(
    questId: string,
    type: 'application' | 'approval' | 'rejection' | 'submission' | 'completion' | 'payment',
    data: any
  ) {
    try {
      const { data: quest } = await supabase
        .from('quests')
        .select('title, company_id, status')
        .eq('id', questId)
        .single()

      if (!quest) return

      let notifications: Array<{
        userId: string
        title: string
        message: string
        data: any
      }> = []

      switch (type) {
        case 'application':
          notifications.push({
            userId: quest.company_id,
            title: 'New Quest Application',
            message: `Someone applied for your quest: ${quest.title}`,
            data: { questId, applicantId: data.applicantId }
          })
          break

        case 'approval':
          notifications.push({
            userId: data.applicantId,
            title: 'Quest Application Approved! 🎉',
            message: `Your application for "${quest.title}" has been approved. Time to start coding!`,
            data: { questId, status: 'approved' }
          })
          break

        case 'rejection':
          notifications.push({
            userId: data.applicantId,
            title: 'Quest Application Update',
            message: `Your application for "${quest.title}" was not selected this time. Keep applying!`,
            data: { questId, status: 'rejected' }
          })
          break

        case 'submission':
          notifications.push({
            userId: quest.company_id,
            title: 'Quest Submission Received',
            message: `A submission has been received for your quest: ${quest.title}`,
            data: { questId, submissionId: data.submissionId }
          })
          break

        case 'completion':
          notifications.push({
            userId: data.adventurerId,
            title: 'Quest Completed! ⚔️',
            message: `Congratulations! You've successfully completed "${quest.title}" and earned ${data.xpEarned} XP!`,
            data: { questId, xpEarned: data.xpEarned, payment: data.payment }
          })
          break

        case 'payment':
          notifications.push({
            userId: data.recipientId,
            title: 'Payment Received 💰',
            message: `You've received $${data.amount} for completing "${quest.title}"`,
            data: { questId, amount: data.amount, transactionId: data.transactionId }
          })
          break
      }

      // Send all notifications
      for (const notification of notifications) {
        await this.createNotification(
          notification.userId,
          notification.title,
          notification.message,
          'quest',
          notification.data,
          type === 'payment' ? 'high' : 'medium'
        )
      }
    } catch (error) {
      console.error('Error sending quest notifications:', error)
    }
  }

  /**
   * Send achievement notifications
   */
  static async notifyAchievement(userId: string, achievement: any) {
    await this.createNotification(
      userId,
      'Achievement Unlocked! 🏆',
      `You've earned the "${achievement.name}" achievement and ${achievement.xpReward} XP!`,
      'achievement',
      { achievementId: achievement.id, xpReward: achievement.xpReward },
      'medium'
    )
  }

  /**
   * Send rank up notifications
   */
  static async notifyRankUp(userId: string, newRank: string, oldRank: string) {
    await this.createNotification(
      userId,
      'Rank Up! 📈',
      `Congratulations! You've advanced from rank ${oldRank} to rank ${newRank}!`,
      'achievement',
      { newRank, oldRank },
      'high'
    )
  }

  /**
   * Send skill unlock notifications
   */
  static async notifySkillUnlock(userId: string, skill: any) {
    await this.createNotification(
      userId,
      'New Skill Unlocked! 🌟',
      `You've unlocked the "${skill.name}" skill! Keep learning and growing.`,
      'achievement',
      { skillId: skill.id },
      'low'
    )
  }

  /**
   * Send payment notifications
   */
  static async notifyPayment(
    userId: string,
    type: 'received' | 'sent' | 'escrow_released',
    amount: number,
    questTitle: string,
    data: any = {}
  ) {
    const titles = {
      received: 'Payment Received 💰',
      sent: 'Payment Sent',
      escrow_released: 'Escrow Payment Released'
    }

    const messages = {
      received: `You've received $${amount} for "${questTitle}"`,
      sent: `Payment of $${amount} has been sent for "${questTitle}"`,
      escrow_released: `Escrow payment of $${amount} has been released for "${questTitle}"`
    }

    await this.createNotification(
      userId,
      titles[type],
      messages[type],
      'payment',
      { amount, questTitle, ...data },
      'high'
    )
  }

  /**
   * Helper methods
   */
  private static formatNotification(raw: any): Notification {
    return {
      id: raw.id,
      userId: raw.user_id,
      title: raw.title,
      message: raw.message,
      type: raw.type,
      data: raw.data,
      isRead: raw.is_read || false,
      createdAt: raw.created_at,
      actionUrl: raw.action_url,
      priority: raw.priority || 'medium'
    }
  }

  private static generateActionUrl(type: Notification['type'], data: any): string | undefined {
    switch (type) {
      case 'quest':
        if (data.questId) return `/quests/${data.questId}`
        break
      case 'payment':
        if (data.transactionId) return `/dashboard/payments`
        break
      case 'achievement':
        return `/profile`
      default:
        return undefined
    }
  }

  private static async sendRealtimeNotification(userId: string, notification: any) {
    // In a real implementation, you might use Supabase realtime or a service like Pusher
    // For now, we rely on the database trigger and subscription
  }

  private static async checkAndSendEmailNotification(userId: string, notification: any) {
    // Check user preferences and send email if enabled
    const preferences = await this.getNotificationPreferences(userId)
    
    const shouldSendEmail = 
      (notification.type === 'quest' && preferences.email.questUpdates) ||
      (notification.type === 'payment' && preferences.email.paymentNotifications) ||
      (notification.type === 'achievement' && preferences.email.achievements) ||
      (notification.type === 'system' && preferences.email.systemAnnouncements)

    if (shouldSendEmail) {
      // In a real implementation, you would send an email here
      // using a service like SendGrid, AWS SES, or Resend
      console.log(`Would send email notification to user ${userId}:`, notification.title)
    }
  }

  private static getDefaultPreferences(): NotificationPreferences {
    return {
      email: {
        questUpdates: true,
        paymentNotifications: true,
        achievements: true,
        systemAnnouncements: true,
        weeklyDigest: true
      },
      push: {
        questUpdates: true,
        paymentNotifications: true,
        achievements: true,
        systemAnnouncements: false
      },
      inApp: {
        all: true
      }
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true)
        .select('id')

      if (error) throw error

      return {
        success: true,
        deletedCount: data?.length || 0
      }
    } catch (error) {
      console.error('Error cleaning up old notifications:', error)
      return { success: false, deletedCount: 0 }
    }
  }

  /**
   * Get notification summary for dashboard
   */
  static async getNotificationSummary(userId: string): Promise<{
    unreadCount: number
    recentNotifications: Notification[]
    urgentCount: number
  }> {
    try {
      const [unread, recent, urgent] = await Promise.all([
        // Get unread count
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
        
        // Get recent notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Get urgent unread count
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
          .eq('priority', 'urgent')
      ])

      return {
        unreadCount: unread.count || 0,
        recentNotifications: recent.data?.map(this.formatNotification) || [],
        urgentCount: urgent.count || 0
      }
    } catch (error) {
      console.error('Error getting notification summary:', error)
      return {
        unreadCount: 0,
        recentNotifications: [],
        urgentCount: 0
      }
    }
  }
}
