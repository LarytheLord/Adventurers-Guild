import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type SkillCategory = Database['public']['Tables']['skill_categories']['Row']
type UserSkill = Database['public']['Tables']['user_skills']['Row']

export class SkillService {
  // Get all skill categories with skills
  static async getSkillCategories() {
    const { data, error } = await supabase
      .from('skill_categories')
      .select(`
        *,
        skills(*)
      `)
      .order('name')

    if (error) throw error
    return data
  }

  // Get user's skill progress
  static async getUserSkills(userId: string) {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill:skills(
          *,
          category:skill_categories(*)
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  // Get user's skill progress by category
  static async getUserSkillsByCategory(userId: string) {
    const categories = await this.getSkillCategories()
    const userSkills = await this.getUserSkills(userId)

    return categories.map(category => {
      const categorySkills = userSkills.filter(
        us => us.skill.category_id === category.id
      )

      const totalPoints = categorySkills.reduce((sum, us) => sum + us.skill_points, 0)
      const progress = (totalPoints / category.max_skill_points) * 100

      return {
        ...category,
        userSkills: categorySkills,
        totalSkillPoints: totalPoints,
        progress: Math.min(progress, 100)
      }
    })
  }

  // Initialize user skills (called when user signs up)
  static async initializeUserSkills(userId: string) {
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')

    if (skillsError) throw skillsError

    const userSkills = skills.map(skill => ({
      user_id: userId,
      skill_id: skill.id,
      level: 0,
      skill_points: 0,
      is_unlocked: skill.prerequisites ? 
        (Array.isArray(skill.prerequisites) && skill.prerequisites.length === 0) : 
        true
    }))

    const { error: insertError } = await supabase
      .from('user_skills')
      .insert(userSkills)

    if (insertError) throw insertError
  }

  // Award skill points
  static async awardSkillPoints(
    userId: string, 
    skillRewards: Record<string, number>,
    sourceType: 'quest_completion' | 'achievement' | 'bonus',
    sourceId: string
  ) {
    for (const [skillName, points] of Object.entries(skillRewards)) {
      // Find skill by name
      const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('name', skillName)
        .single()

      if (skillError) continue

      // Update user skill
      const { data: userSkill, error: userSkillError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skill.id)
        .single()

      if (userSkillError) continue

      const newPoints = userSkill.skill_points + points
      const newLevel = Math.floor(newPoints / skill.points_per_level)
      const maxLevel = skill.max_level

      const { error: updateError } = await supabase
        .from('user_skills')
        .update({
          skill_points: newPoints,
          level: Math.min(newLevel, maxLevel),
          is_unlocked: true,
          unlocked_at: userSkill.unlocked_at || new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('skill_id', skill.id)

      if (updateError) continue

      // Record transaction
      await supabase
        .from('skill_transactions')
        .insert({
          user_id: userId,
          skill_id: skill.id,
          points: points,
          source_type: sourceType,
          source_id: sourceId,
          description: `Awarded ${points} points for ${skillName}`
        })
    }

    // Check for new skill unlocks
    await this.checkSkillUnlocks(userId)
  }

  // Check for skill unlocks based on prerequisites
  static async checkSkillUnlocks(userId: string) {
    const { data: userSkills, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', userId)
      .eq('is_unlocked', false)

    if (error) return

    for (const userSkill of userSkills) {
      const prerequisites = userSkill.skill.prerequisites as string[] || []
      
      if (prerequisites.length === 0) continue

      // Check if all prerequisites are met
      const { data: prereqSkills, error: prereqError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .in('skill_id', prerequisites)

      if (prereqError) continue

      const allPrereqsMet = prereqSkills.every(ps => ps.is_unlocked && ps.level > 0)

      if (allPrereqsMet) {
        await supabase
          .from('user_skills')
          .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('skill_id', userSkill.skill_id)
      }
    }
  }

  // Get skill leaderboard
  static async getSkillLeaderboard(skillId?: string, limit = 10) {
    let query = supabase
      .from('user_skills')
      .select(`
        *,
        user:users(name, avatar_url, rank),
        skill:skills(name)
      `)
      .eq('is_unlocked', true)
      .order('skill_points', { ascending: false })
      .limit(limit)

    if (skillId) {
      query = query.eq('skill_id', skillId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  // Get user's skill transactions (history)
  static async getUserSkillTransactions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('skill_transactions')
      .select(`
        *,
        skill:skills(name, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}