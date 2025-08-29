import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type Quest = Database['public']['Tables']['quests']['Row']
type QuestInsert = Database['public']['Tables']['quests']['Insert']
type QuestUpdate = Database['public']['Tables']['quests']['Update']

export class QuestService {
  // Get all active quests with filters
  static async getQuests(filters?: {
    difficulty?: string
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('quests')
      .select(`
        *,
        company:users!quests_company_id_fkey(name, avatar_url),
        applications:quest_applications(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  // Get quest by ID
  static async getQuestById(id: string) {
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        company:users!quests_company_id_fkey(name, avatar_url, email),
        assigned_user:users!quests_assigned_to_fkey(name, avatar_url),
        applications:quest_applications(
          *,
          user:users(name, avatar_url, rank, xp)
        ),
        submissions:quest_submissions(
          *,
          user:users(name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Create new quest (companies only)
  static async createQuest(questData: QuestInsert) {
    const { data, error } = await supabase
      .from('quests')
      .insert(questData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update quest
  static async updateQuest(id: string, updates: QuestUpdate) {
    const { data, error } = await supabase
      .from('quests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete quest
  static async deleteQuest(id: string) {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Apply to quest
  static async applyToQuest(questId: string, userId: string, application: {
    cover_letter?: string
    proposed_timeline?: string
  }) {
    const { data, error } = await supabase
      .from('quest_applications')
      .insert({
        quest_id: questId,
        user_id: userId,
        ...application
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user's applications
  static async getUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('quest_applications')
      .select(`
        *,
        quest:quests(title, difficulty, xp_reward, status)
      `)
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Accept application (assign quest)
  static async acceptApplication(applicationId: string, questId: string, userId: string) {
    // Start transaction-like operations
    const { error: updateQuestError } = await supabase
      .from('quests')
      .update({ 
        assigned_to: userId, 
        status: 'in_progress' 
      })
      .eq('id', questId)

    if (updateQuestError) throw updateQuestError

    const { error: updateApplicationError } = await supabase
      .from('quest_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    if (updateApplicationError) throw updateApplicationError

    // Reject other applications
    const { error: rejectOthersError } = await supabase
      .from('quest_applications')
      .update({ status: 'rejected' })
      .eq('quest_id', questId)
      .neq('id', applicationId)

    if (rejectOthersError) throw rejectOthersError

    return true
  }

  // Submit quest work
  static async submitQuest(questId: string, userId: string, submission: {
    submission_url?: string
    github_repo?: string
    demo_url?: string
    description: string
    attachments?: {name: string, url: string, type: string}[]
  }) {
    const { data, error } = await supabase
      .from('quest_submissions')
      .insert({
        quest_id: questId,
        user_id: userId,
        ...submission
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Review submission
  static async reviewSubmission(submissionId: string, review: {
    status: 'approved' | 'rejected' | 'revision_requested'
    feedback?: string
    rating?: number
  }) {
    const { data, error } = await supabase
      .from('quest_submissions')
      .update({
        ...review,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) throw error

    // If approved, complete the quest and award points
    if (review.status === 'approved') {
      await this.completeQuest(data.quest_id, data.user_id)
    }

    return data
  }

  // Complete quest and award points
  static async completeQuest(questId: string, userId: string) {
    // Get quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()

    if (questError) throw questError

    // Update quest status
    const { error: updateError } = await supabase
      .from('quests')
      .update({ status: 'completed' })
      .eq('id', questId)

    if (updateError) throw updateError

    // Award XP and skill points
    await this.awardQuestRewards(userId, quest.xp_reward, quest.skill_rewards as {[key: string]: number})

    return true
  }

  // Award quest rewards
  static async awardQuestRewards(userId: string, xpReward: number, skillRewards: Record<string, number>) {
    // Update user XP
    const { error: xpError } = await supabase.rpc('increment_user_xp', {
      user_id: userId,
      xp_amount: xpReward
    })

    if (xpError) console.error('XP award error:', xpError)

    // Award skill points
    for (const [skillName, points] of Object.entries(skillRewards)) {
      const { error: skillError } = await supabase.rpc('award_skill_points', {
        user_id: userId,
        skill_name: skillName,
        points: points
      })

      if (skillError) console.error('Skill points award error:', skillError)
    }

    // Check for rank up
    await this.checkRankUp(userId)
  }

  // Check if user should rank up
  static async checkRankUp(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('xp, rank')
      .eq('id', userId)
      .single()

    if (error) return

    const rankThresholds = {
      'F': 0,
      'D': 1000,
      'C': 3000,
      'B': 7000,
      'A': 15000,
      'S': 30000
    }

    const ranks = ['F', 'D', 'C', 'B', 'A', 'S']
    const currentRankIndex = ranks.indexOf(user.rank)
    
    for (let i = currentRankIndex + 1; i < ranks.length; i++) {
      const nextRank = ranks[i] as keyof typeof rankThresholds
      if (user.xp >= rankThresholds[nextRank]) {
        await supabase
          .from('users')
          .update({ rank: nextRank })
          .eq('id', userId)
      } else {
        break
      }
    }
  }
}