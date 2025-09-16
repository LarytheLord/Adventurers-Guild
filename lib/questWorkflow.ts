import { supabase } from './supabase'
import { BusinessLogicService } from './businessLogic'
import { PaymentService } from './paymentService'

export type QuestStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested'

export interface QuestWorkflowResult {
  success: boolean
  message: string
  data?: any
  notifications?: Array<{
    user_id: string
    title: string
    message: string
    type: string
    data?: any
  }>
}

export class QuestWorkflowService {
  
  /**
   * Submit quest application with validation and notifications
   */
  static async submitApplication(
    questId: string, 
    userId: string, 
    applicationData: {
      cover_letter: string
      proposed_timeline: string
    }
  ): Promise<QuestWorkflowResult> {
    try {
      // Validate quest eligibility
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('id, title, difficulty, status, company_id, max_applicants')
        .eq('id', questId)
        .single()

      if (questError || !quest) {
        return { success: false, message: 'Quest not found' }
      }

      if (quest.status !== 'active') {
        return { success: false, message: 'Quest is not accepting applications' }
      }

      // Check if user already applied
      const { data: existingApp } = await supabase
        .from('quest_applications')
        .select('id')
        .eq('quest_id', questId)
        .eq('user_id', userId)
        .single()

      if (existingApp) {
        return { success: false, message: 'You have already applied to this quest' }
      }

      // Check application limit
      const { data: currentApps, error: appsError } = await supabase
        .from('quest_applications')
        .select('id')
        .eq('quest_id', questId)

      if (appsError) {
        return { success: false, message: 'Failed to check application count' }
      }

      if (currentApps.length >= quest.max_applicants) {
        return { success: false, message: 'Quest has reached maximum number of applicants' }
      }

      // Check user rank eligibility
      const { data: user } = await supabase
        .from('users')
        .select('rank, name')
        .eq('id', userId)
        .single()

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      if (!BusinessLogicService.canAccessQuest(user.rank as any, quest.difficulty as any)) {
        return { success: false, message: 'Your rank is too low for this quest difficulty' }
      }

      // Create application
      const { data: application, error: createError } = await supabase
        .from('quest_applications')
        .insert({
          quest_id: questId,
          user_id: userId,
          cover_letter: applicationData.cover_letter,
          proposed_timeline: applicationData.proposed_timeline,
          status: 'pending'
        })
        .select()
        .single()

      if (createError) {
        return { success: false, message: 'Failed to submit application' }
      }

      // Create notifications
      const notifications = [
        {
          user_id: quest.company_id,
          title: 'New Quest Application',
          message: `${user.name} has applied to your quest "${quest.title}"`,
          type: 'quest_application',
          data: {
            quest_id: questId,
            application_id: application.id,
            applicant_name: user.name
          }
        },
        {
          user_id: userId,
          title: 'Application Submitted',
          message: `Your application for "${quest.title}" has been submitted successfully`,
          type: 'application_submitted',
          data: {
            quest_id: questId,
            application_id: application.id
          }
        }
      ]

      // Send notifications
      await supabase.from('notifications').insert(notifications)

      return {
        success: true,
        message: 'Application submitted successfully',
        data: application,
        notifications
      }

    } catch (error) {
      console.error('Submit application error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  /**
   * Review quest application (approve/reject)
   */
  static async reviewApplication(
    applicationId: string,
    reviewerId: string,
    decision: {
      status: ApplicationStatus
      reviewer_notes?: string
    }
  ): Promise<QuestWorkflowResult> {
    try {
      // Get application details
      const { data: application, error: appError } = await supabase
        .from('quest_applications')
        .select(`
          *,
          quest:quests(id, title, company_id, status, difficulty),
          user:users(id, name, rank)
        `)
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        return { success: false, message: 'Application not found' }
      }

      // Verify reviewer is the quest owner
      if (application.quest.company_id !== reviewerId) {
        return { success: false, message: 'Not authorized to review this application' }
      }

      // Update application
      const { data: updatedApp, error: updateError } = await supabase
        .from('quest_applications')
        .update({
          status: decision.status,
          reviewer_notes: decision.reviewer_notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (updateError) {
        return { success: false, message: 'Failed to update application' }
      }

      const notifications: any[] = []

      // If approved, assign quest and reject other applications
      if (decision.status === 'approved') {
        // Update quest status and assign to user
        const { error: questUpdateError } = await supabase
          .from('quests')
          .update({
            status: 'in_progress',
            assigned_to: application.user_id
          })
          .eq('id', application.quest_id)

        if (questUpdateError) {
          return { success: false, message: 'Failed to assign quest' }
        }

        // Reject other pending applications
        const { data: otherApps, error: otherAppsError } = await supabase
          .from('quest_applications')
          .select('id, user_id, users(name)')
          .eq('quest_id', application.quest_id)
          .eq('status', 'pending')
          .neq('id', applicationId)

        if (!otherAppsError && otherApps) {
          await supabase
            .from('quest_applications')
            .update({ 
              status: 'rejected',
              reviewer_notes: 'Quest was assigned to another applicant'
            })
            .eq('quest_id', application.quest_id)
            .eq('status', 'pending')
            .neq('id', applicationId)

          // Add notifications for rejected applicants
          otherApps.forEach(app => {
            notifications.push({
              user_id: app.user_id,
              title: 'Application Update',
              message: `Your application for "${application.quest.title}" was not selected`,
              type: 'application_rejected',
              data: {
                quest_id: application.quest_id,
                application_id: app.id
              }
            })
          })
        }

        // Add success notification for approved applicant
        notifications.push({
          user_id: application.user_id,
          title: 'Quest Assigned!',
          message: `Congratulations! You've been assigned to "${application.quest.title}"`,
          type: 'quest_assigned',
          data: {
            quest_id: application.quest_id,
            application_id: applicationId
          }
        })
      } else {
        // Add rejection notification
        notifications.push({
          user_id: application.user_id,
          title: 'Application Update',
          message: `Your application for "${application.quest.title}" has been ${decision.status}`,
          type: `application_${decision.status}`,
          data: {
            quest_id: application.quest_id,
            application_id: applicationId,
            notes: decision.reviewer_notes
          }
        })
      }

      // Send notifications
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      return {
        success: true,
        message: `Application ${decision.status} successfully`,
        data: updatedApp,
        notifications
      }

    } catch (error) {
      console.error('Review application error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  /**
   * Submit quest work for review
   */
  static async submitQuestWork(
    questId: string,
    userId: string,
    submissionData: {
      submission_url?: string
      github_repo?: string
      demo_url?: string
      description: string
      attachments?: any[]
    }
  ): Promise<QuestWorkflowResult> {
    try {
      // Validate quest assignment
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('id, title, company_id, assigned_to, status')
        .eq('id', questId)
        .single()

      if (questError || !quest) {
        return { success: false, message: 'Quest not found' }
      }

      if (quest.assigned_to !== userId) {
        return { success: false, message: 'Quest is not assigned to you' }
      }

      if (quest.status !== 'in_progress') {
        return { success: false, message: 'Quest is not in progress' }
      }

      // Check if already submitted
      const { data: existingSubmission } = await supabase
        .from('quest_submissions')
        .select('id, status')
        .eq('quest_id', questId)
        .eq('user_id', userId)
        .single()

      if (existingSubmission && existingSubmission.status === 'pending') {
        return { success: false, message: 'You have already submitted work for this quest' }
      }

      // Create submission
      const { data: submission, error: submitError } = await supabase
        .from('quest_submissions')
        .insert({
          quest_id: questId,
          user_id: userId,
          ...submissionData,
          status: 'pending'
        })
        .select()
        .single()

      if (submitError) {
        return { success: false, message: 'Failed to submit work' }
      }

      // Get user name for notification
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single()

      // Create notification for company
      const notification = {
        user_id: quest.company_id,
        title: 'Quest Submission Received',
        message: `${user?.name || 'An adventurer'} has submitted work for "${quest.title}"`,
        type: 'quest_submission',
        data: {
          quest_id: questId,
          submission_id: submission.id,
          submitter_name: user?.name
        }
      }

      await supabase.from('notifications').insert(notification)

      return {
        success: true,
        message: 'Work submitted successfully',
        data: submission,
        notifications: [notification]
      }

    } catch (error) {
      console.error('Submit quest work error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  /**
   * Review quest submission (approve/reject)
   */
  static async reviewSubmission(
    submissionId: string,
    reviewerId: string,
    review: {
      status: SubmissionStatus
      feedback?: string
      rating?: number
      time_to_complete?: number
    }
  ): Promise<QuestWorkflowResult> {
    try {
      // Get submission details
      const { data: submission, error: subError } = await supabase
        .from('quest_submissions')
        .select(`
          *,
          quest:quests(id, title, company_id, assigned_to, xp_reward, budget),
          user:users(id, name, xp, rank, total_earnings)
        `)
        .eq('id', submissionId)
        .single()

      if (subError || !submission) {
        return { success: false, message: 'Submission not found' }
      }

      // Verify reviewer is the quest owner
      if (submission.quest.company_id !== reviewerId) {
        return { success: false, message: 'Not authorized to review this submission' }
      }

      // Update submission
      const { error: updateError } = await supabase
        .from('quest_submissions')
        .update({
          status: review.status,
          feedback: review.feedback,
          rating: review.rating,
          reviewed_at: new Date().toISOString(),
          reviewer_id: reviewerId
        })
        .eq('id', submissionId)

      if (updateError) {
        return { success: false, message: 'Failed to update submission' }
      }

      const notifications: any[] = []

      // If approved, complete quest and award XP/payment
      if (review.status === 'approved') {
        const completionResult = await BusinessLogicService.completeQuest(
          submission.quest_id,
          submission.user_id,
          {
            timeToComplete: review.time_to_complete || 24, // Default 24 hours if not provided
            rating: review.rating || 5
          }
        )

        // Release payment if escrow exists
        try {
          await PaymentService.releaseEscrowPayment(submission.quest_id)
        } catch (paymentError) {
          console.error('Payment release failed:', paymentError)
          // Continue with the rest of the process even if payment fails
        }

        notifications.push({
          user_id: submission.user_id,
          title: 'Quest Completed!',
          message: `Your work on "${submission.quest.title}" has been approved! You earned ${completionResult.xpResult.totalXP} XP${completionResult.rankResult.rankedUp ? ` and ranked up to ${completionResult.rankResult.newRank}!` : '.'}`,
          type: 'quest_completed',
          data: {
            quest_id: submission.quest_id,
            xp_gained: completionResult.xpResult.totalXP,
            rank_up: completionResult.rankResult.rankedUp,
            new_rank: completionResult.rankResult.newRank,
            payment: completionResult.paymentResult.adventurerPayment
          }
        })
      } else {
        // Add notification for revision or rejection
        notifications.push({
          user_id: submission.user_id,
          title: 'Submission Update',
          message: `Your submission for "${submission.quest.title}" has been ${review.status}`,
          type: `submission_${review.status}`,
          data: {
            quest_id: submission.quest_id,
            submission_id: submissionId,
            feedback: review.feedback,
            rating: review.rating
          }
        })
      }

      // Send notifications
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      return {
        success: true,
        message: `Submission ${review.status} successfully`,
        notifications
      }

    } catch (error) {
      console.error('Review submission error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  /**
   * Cancel quest (with refund if payment exists)
   */
  static async cancelQuest(
    questId: string,
    userId: string,
    reason: string
  ): Promise<QuestWorkflowResult> {
    try {
      // Get quest details
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('id, title, company_id, assigned_to, status')
        .eq('id', questId)
        .single()

      if (questError || !quest) {
        return { success: false, message: 'Quest not found' }
      }

      // Verify authorization (company owner or assigned adventurer)
      if (quest.company_id !== userId && quest.assigned_to !== userId) {
        return { success: false, message: 'Not authorized to cancel this quest' }
      }

      // Update quest status
      const { error: updateError } = await supabase
        .from('quests')
        .update({ status: 'cancelled' })
        .eq('id', questId)

      if (updateError) {
        return { success: false, message: 'Failed to cancel quest' }
      }

      // Refund payment if exists
      try {
        await PaymentService.refundEscrowPayment(questId, reason)
      } catch (paymentError) {
        console.error('Payment refund failed:', paymentError)
        // Continue with cancellation even if refund fails
      }

      // Create notifications
      const notifications: any[] = []

      if (quest.assigned_to && quest.assigned_to !== userId) {
        notifications.push({
          user_id: quest.assigned_to,
          title: 'Quest Cancelled',
          message: `The quest "${quest.title}" has been cancelled. Reason: ${reason}`,
          type: 'quest_cancelled',
          data: {
            quest_id: questId,
            reason
          }
        })
      }

      if (quest.company_id !== userId) {
        notifications.push({
          user_id: quest.company_id,
          title: 'Quest Cancelled',
          message: `Your quest "${quest.title}" has been cancelled. Reason: ${reason}`,
          type: 'quest_cancelled',
          data: {
            quest_id: questId,
            reason
          }
        })
      }

      // Send notifications
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      return {
        success: true,
        message: 'Quest cancelled successfully',
        notifications
      }

    } catch (error) {
      console.error('Cancel quest error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  /**
   * Get quest analytics for companies
   */
  static async getQuestAnalytics(companyId: string, questId?: string): Promise<any> {
    try {
      let query = supabase
        .from('quests')
        .select(`
          id, title, status, difficulty, budget, xp_reward, created_at,
          applications:quest_applications(count),
          submissions:quest_submissions(count)
        `)
        .eq('company_id', companyId)

      if (questId) {
        query = query.eq('id', questId)
      }

      const { data: quests, error } = await query

      if (error) {
        return { success: false, message: 'Failed to fetch analytics' }
      }

      // Calculate summary stats
      const totalQuests = quests?.length || 0
      const activeQuests = quests?.filter(q => q.status === 'active').length || 0
      const completedQuests = quests?.filter(q => q.status === 'completed').length || 0
      const totalApplications = quests?.reduce((sum, q) => sum + (q.applications?.[0]?.count || 0), 0) || 0
      const totalBudget = quests?.reduce((sum, q) => sum + (q.budget || 0), 0) || 0

      return {
        success: true,
        data: {
          summary: {
            totalQuests,
            activeQuests,
            completedQuests,
            totalApplications,
            totalBudget,
            avgApplicationsPerQuest: totalQuests > 0 ? totalApplications / totalQuests : 0
          },
          quests: quests || []
        }
      }

    } catch (error) {
      console.error('Get quest analytics error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }
}
