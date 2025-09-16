import { supabase } from './supabase'
import { PaymentService } from './paymentService'
import { QuestWorkflowService } from './questWorkflow'

export interface PlatformStats {
  users: {
    total: number
    students: number
    companies: number
    admins: number
    newThisMonth: number
    activeThisMonth: number
  }
  quests: {
    total: number
    active: number
    completed: number
    draft: number
    totalBudget: number
    avgCompletionTime: number
  }
  revenue: {
    totalRevenue: number
    monthlyRevenue: number
    pendingRevenue: number
    transactionCount: number
    avgTransactionValue: number
  }
  engagement: {
    avgQuestsPerUser: number
    completionRate: number
    avgRating: number
    topSkillCategories: Array<{ name: string; count: number }>
  }
}

export interface UserAnalytics {
  id: string
  name: string
  email: string
  role: 'student' | 'company' | 'admin' | 'client'
  rank?: string
  xp?: number
  totalEarnings?: number
  questsCompleted?: number
  questsPosted?: number
  joinedAt: string
  lastActive?: string
  isActive: boolean
}

export interface QuestAnalytics {
  id: string
  title: string
  status: string
  difficulty: string
  budget: number
  applicationsCount: number
  submissionsCount: number
  companyName: string
  createdAt: string
  completedAt?: string
  rating?: number
}

export class AdminService {
  /**
   * Get comprehensive platform statistics
   */
  static async getPlatformStats(): Promise<PlatformStats> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get user statistics
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role, created_at, updated_at')

    if (usersError) throw usersError

    const userStats = {
      total: users?.length || 0,
      students: users?.filter(u => u.role === 'student').length || 0,
      companies: users?.filter(u => u.role === 'company' || u.role === 'client').length || 0,
      admins: users?.filter(u => u.role === 'admin').length || 0,
      newThisMonth: users?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0,
      activeThisMonth: users?.filter(u => new Date(u.updated_at) >= thirtyDaysAgo).length || 0
    }

    // Get quest statistics
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('status, budget, created_at, difficulty')

    if (questsError) throw questsError

    const questStats = {
      total: quests?.length || 0,
      active: quests?.filter(q => q.status === 'active').length || 0,
      completed: quests?.filter(q => q.status === 'completed').length || 0,
      draft: quests?.filter(q => q.status === 'draft').length || 0,
      totalBudget: quests?.reduce((sum, q) => sum + (q.budget || 0), 0) || 0,
      avgCompletionTime: 0 // Would need completion time tracking
    }

    // Get revenue statistics
    const revenueStats = await PaymentService.getPlatformRevenue()

    // Get engagement statistics
    const { data: submissions, error: submissionsError } = await supabase
      .from('quest_submissions')
      .select('rating, status')

    const { data: skillCategories, error: skillError } = await supabase
      .from('skill_categories')
      .select('name')

    const avgRating = submissions?.filter(s => s.rating)
      .reduce((sum, s) => sum + s.rating!, 0) / (submissions?.filter(s => s.rating).length || 1) || 0

    const completionRate = submissions?.length > 0 
      ? (submissions.filter(s => s.status === 'approved').length / submissions.length) * 100 
      : 0

    const engagementStats = {
      avgQuestsPerUser: userStats.students > 0 ? questStats.total / userStats.students : 0,
      completionRate,
      avgRating,
      topSkillCategories: skillCategories?.map(cat => ({ name: cat.name, count: 0 })) || []
    }

    return {
      users: userStats,
      quests: questStats,
      revenue: {
        totalRevenue: revenueStats.totalRevenue,
        monthlyRevenue: revenueStats.totalRevenue, // Would need proper monthly calculation
        pendingRevenue: revenueStats.pendingRevenue,
        transactionCount: revenueStats.transactionCount,
        avgTransactionValue: revenueStats.transactionCount > 0 
          ? revenueStats.totalRevenue / revenueStats.transactionCount 
          : 0
      },
      engagement: engagementStats
    }
  }

  /**
   * Get detailed user analytics
   */
  static async getUserAnalytics(limit = 50, offset = 0): Promise<{
    users: UserAnalytics[]
    total: number
  }> {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id, name, email, role, rank, xp, total_earnings, is_active,
        created_at, updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (usersError) throw usersError

    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get quest completion counts for students
    const studentIds = users?.filter(u => u.role === 'student').map(u => u.id) || []
    const { data: completions } = await supabase
      .from('quest_submissions')
      .select('user_id')
      .eq('status', 'approved')
      .in('user_id', studentIds)

    // Get quest posting counts for companies
    const companyIds = users?.filter(u => u.role === 'company' || u.role === 'client').map(u => u.id) || []
    const { data: postedQuests } = await supabase
      .from('quests')
      .select('company_id')
      .in('company_id', companyIds)

    const userAnalytics: UserAnalytics[] = users?.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role as any,
      rank: user.rank || undefined,
      xp: user.xp || undefined,
      totalEarnings: user.total_earnings || undefined,
      questsCompleted: completions?.filter(c => c.user_id === user.id).length || 0,
      questsPosted: postedQuests?.filter(q => q.company_id === user.id).length || 0,
      joinedAt: user.created_at,
      lastActive: user.updated_at,
      isActive: user.is_active
    })) || []

    return {
      users: userAnalytics,
      total: count || 0
    }
  }

  /**
   * Get quest analytics
   */
  static async getQuestAnalytics(limit = 50, offset = 0): Promise<{
    quests: QuestAnalytics[]
    total: number
  }> {
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select(`
        id, title, status, difficulty, budget, created_at,
        company:users!quests_company_id_fkey(name),
        applications:quest_applications(count),
        submissions:quest_submissions(count, rating, status)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (questsError) throw questsError

    const { count } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })

    const questAnalytics: QuestAnalytics[] = quests?.map(quest => {
      const submissions = quest.submissions as any[] || []
      const avgRating = submissions.filter(s => s.rating).length > 0
        ? submissions.filter(s => s.rating).reduce((sum, s) => sum + s.rating, 0) / submissions.filter(s => s.rating).length
        : undefined

      return {
        id: quest.id,
        title: quest.title,
        status: quest.status,
        difficulty: quest.difficulty,
        budget: quest.budget || 0,
        applicationsCount: (quest.applications as any)?.[0]?.count || 0,
        submissionsCount: submissions.length,
        companyName: (quest.company as any)?.name || 'Unknown',
        createdAt: quest.created_at,
        completedAt: quest.status === 'completed' ? quest.created_at : undefined, // Would need proper completion tracking
        rating: avgRating
      }
    }) || []

    return {
      quests: questAnalytics,
      total: count || 0
    }
  }

  /**
   * Moderate user account
   */
  static async moderateUser(
    userId: string,
    action: 'activate' | 'deactivate' | 'promote' | 'demote' | 'delete',
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      switch (action) {
        case 'activate':
          await supabase
            .from('users')
            .update({ is_active: true })
            .eq('id', userId)
          break

        case 'deactivate':
          await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', userId)
          break

        case 'promote':
          // Promote student to company or company to admin (simplified)
          const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

          if (user?.role === 'student') {
            await supabase
              .from('users')
              .update({ role: 'company' })
              .eq('id', userId)
          }
          break

        case 'demote':
          // Demote admin to company or company to student (simplified)
          const { data: userToDemote } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

          if (userToDemote?.role === 'admin') {
            await supabase
              .from('users')
              .update({ role: 'company' })
              .eq('id', userId)
          } else if (userToDemote?.role === 'company') {
            await supabase
              .from('users')
              .update({ role: 'student' })
              .eq('id', userId)
          }
          break

        case 'delete':
          // Soft delete by deactivating
          await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', userId)
          break
      }

      // Log moderation action
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Account Update',
          message: `Your account has been ${action}ed by an administrator.`,
          type: 'moderation',
          data: { action, reason }
        })

      return {
        success: true,
        message: `User ${action}ed successfully`
      }
    } catch (error) {
      console.error('User moderation error:', error)
      return {
        success: false,
        message: `Failed to ${action} user`
      }
    }
  }

  /**
   * Moderate quest
   */
  static async moderateQuest(
    questId: string,
    action: 'approve' | 'reject' | 'suspend' | 'feature' | 'unfeature',
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updates: any = {}

      switch (action) {
        case 'approve':
          updates.status = 'active'
          break
        case 'reject':
          updates.status = 'cancelled'
          break
        case 'suspend':
          updates.status = 'cancelled'
          break
        case 'feature':
          updates.is_featured = true
          break
        case 'unfeature':
          updates.is_featured = false
          break
      }

      const { error } = await supabase
        .from('quests')
        .update(updates)
        .eq('id', questId)

      if (error) throw error

      // Get quest details for notification
      const { data: quest } = await supabase
        .from('quests')
        .select('title, company_id')
        .eq('id', questId)
        .single()

      if (quest) {
        await supabase
          .from('notifications')
          .insert({
            user_id: quest.company_id,
            title: 'Quest Update',
            message: `Your quest "${quest.title}" has been ${action}ed by an administrator.`,
            type: 'quest_moderation',
            data: { action, reason, quest_id: questId }
          })
      }

      return {
        success: true,
        message: `Quest ${action}ed successfully`
      }
    } catch (error) {
      console.error('Quest moderation error:', error)
      return {
        success: false,
        message: `Failed to ${action} quest`
      }
    }
  }

  /**
   * Get platform activity logs
   */
  static async getActivityLogs(limit = 100): Promise<Array<{
    id: string
    type: string
    description: string
    userId?: string
    userName?: string
    timestamp: string
    metadata?: any
  }>> {
    // Get recent notifications as activity logs
    const { data: activities, error } = await supabase
      .from('notifications')
      .select(`
        id, title, message, type, data, created_at,
        user:users(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch activity logs:', error)
      return []
    }

    return activities?.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: `${activity.title}: ${activity.message}`,
      userId: activity.user ? 'user_id' : undefined,
      userName: (activity.user as any)?.name || 'Unknown User',
      timestamp: activity.created_at,
      metadata: activity.data
    })) || []
  }

  /**
   * Export platform data
   */
  static async exportData(type: 'users' | 'quests' | 'transactions' | 'all'): Promise<{
    success: boolean
    downloadUrl?: string
    message: string
  }> {
    try {
      // This would typically generate a CSV/Excel file and upload to storage
      // For now, we'll return a simulated response
      
      let data: any[] = []
      
      switch (type) {
        case 'users':
          const { data: users } = await supabase
            .from('users')
            .select('*')
          data = users || []
          break
          
        case 'quests':
          const { data: quests } = await supabase
            .from('quests')
            .select('*')
          data = quests || []
          break
          
        case 'transactions':
          const { data: transactions } = await supabase
            .from('escrow_payments')
            .select('*')
          data = transactions || []
          break
          
        case 'all':
          // Would combine all data types
          break
      }

      // In a real implementation, you would:
      // 1. Convert data to CSV/Excel format
      // 2. Upload to storage (Supabase Storage, AWS S3, etc.)
      // 3. Return the download URL
      
      return {
        success: true,
        downloadUrl: `/api/admin/export/${type}?timestamp=${Date.now()}`,
        message: `${type} data export initiated successfully`
      }
    } catch (error) {
      console.error('Data export error:', error)
      return {
        success: false,
        message: 'Failed to export data'
      }
    }
  }

  /**
   * Send platform-wide announcement
   */
  static async sendAnnouncement(
    title: string,
    message: string,
    targetRole?: 'student' | 'company' | 'admin' | 'all'
  ): Promise<{ success: boolean; message: string }> {
    try {
      let userQuery = supabase.from('users').select('id')

      if (targetRole && targetRole !== 'all') {
        userQuery = userQuery.eq('role', targetRole)
      }

      const { data: users, error: usersError } = await userQuery

      if (usersError) throw usersError

      const notifications = users?.map(user => ({
        user_id: user.id,
        title,
        message,
        type: 'announcement',
        data: { target_role: targetRole }
      })) || []

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notificationError) throw notificationError

      return {
        success: true,
        message: `Announcement sent to ${users?.length || 0} users`
      }
    } catch (error) {
      console.error('Announcement error:', error)
      return {
        success: false,
        message: 'Failed to send announcement'
      }
    }
  }
}
