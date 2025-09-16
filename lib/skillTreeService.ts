import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type SkillCategory = Database['public']['Tables']['skill_categories']['Row']
type Skill = Database['public']['Tables']['skills']['Row']
type UserSkill = Database['public']['Tables']['user_skills']['Row']

export interface SkillTreeNode {
  id: string
  name: string
  description: string
  category: string
  level: number
  maxLevel: number
  skillPoints: number
  pointsToNextLevel: number
  isUnlocked: boolean
  icon: string
  color: string
  prerequisites: string[]
  dependents: string[]
  position: { x: number; y: number }
  unlockedAt?: string
}

export interface SkillTreeCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  totalSkillPoints: number
  maxSkillPoints: number
  progress: number
  skills: SkillTreeNode[]
  isUnlocked: boolean
}

export interface SkillTreeData {
  categories: SkillTreeCategory[]
  totalXP: number
  totalSkillPoints: number
  unlockedSkills: number
  totalSkills: number
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  badgeColor: string
  xpReward: number
  skillRewards: Record<string, number>
  isUnlocked: boolean
  unlockedAt?: string
}

export class SkillTreeService {
  /**
   * Get complete skill tree data for a user
   */
  static async getUserSkillTree(userId: string): Promise<SkillTreeData> {
    // Get user's current stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, rank')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get all skill categories with skills
    const { data: categories, error: categoriesError } = await supabase
      .from('skill_categories')
      .select(`
        *,
        skills(*)
      `)
      .order('name')

    if (categoriesError) throw categoriesError

    // Get user's skill progress
    const { data: userSkills, error: userSkillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)

    if (userSkillsError) throw userSkillsError

    // Get user's achievements
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)

    if (achievementsError) throw achievementsError

    // Build skill tree structure
    const skillTreeCategories: SkillTreeCategory[] = categories.map(category => {
      const categoryUserSkills = userSkills.filter(us => 
        category.skills.some(s => s.id === us.skill_id)
      )

      const totalSkillPoints = categoryUserSkills.reduce((sum, us) => sum + us.skill_points, 0)
      const progress = (totalSkillPoints / category.max_skill_points) * 100

      const skills: SkillTreeNode[] = category.skills.map((skill, index) => {
        const userSkill = userSkills.find(us => us.skill_id === skill.id)
        const pointsToNextLevel = userSkill 
          ? Math.max(0, (userSkill.level + 1) * skill.points_per_level - userSkill.skill_points)
          : skill.points_per_level

        return {
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
          category: category.name,
          level: userSkill?.level || 0,
          maxLevel: skill.max_level,
          skillPoints: userSkill?.skill_points || 0,
          pointsToNextLevel,
          isUnlocked: userSkill?.is_unlocked || false,
          icon: skill.icon || 'Code',
          color: skill.color || category.color || 'bg-gray-500',
          prerequisites: (skill.prerequisites as string[]) || [],
          dependents: [], // Will be populated below
          position: this.calculateSkillPosition(index, category.skills.length),
          unlockedAt: userSkill?.unlocked_at || undefined
        }
      })

      // Calculate dependents for each skill
      skills.forEach(skill => {
        skill.dependents = skills
          .filter(s => s.prerequisites.includes(skill.id))
          .map(s => s.id)
      })

      return {
        id: category.id,
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'Code',
        color: category.color || 'bg-gray-500',
        totalSkillPoints,
        maxSkillPoints: category.max_skill_points,
        progress: Math.min(progress, 100),
        skills,
        isUnlocked: totalSkillPoints > 0 || skills.some(s => s.isUnlocked)
      }
    })

    const achievements: Achievement[] = userAchievements.map(ua => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description || '',
      icon: ua.achievement.icon || '🏆',
      badgeColor: ua.achievement.badge_color || 'bg-yellow-500',
      xpReward: ua.achievement.xp_reward,
      skillRewards: (ua.achievement.skill_rewards as Record<string, number>) || {},
      isUnlocked: true,
      unlockedAt: ua.earned_at
    }))

    const totalSkillPoints = skillTreeCategories.reduce((sum, cat) => sum + cat.totalSkillPoints, 0)
    const unlockedSkills = skillTreeCategories.reduce((sum, cat) => 
      sum + cat.skills.filter(s => s.isUnlocked).length, 0
    )
    const totalSkills = skillTreeCategories.reduce((sum, cat) => sum + cat.skills.length, 0)

    return {
      categories: skillTreeCategories,
      totalXP: user.xp,
      totalSkillPoints,
      unlockedSkills,
      totalSkills,
      achievements
    }
  }

  /**
   * Calculate position for skill node in skill tree visualization
   */
  private static calculateSkillPosition(index: number, totalSkills: number): { x: number; y: number } {
    const cols = Math.ceil(Math.sqrt(totalSkills))
    const row = Math.floor(index / cols)
    const col = index % cols
    
    return {
      x: col * 120 + 60, // 120px spacing
      y: row * 100 + 50  // 100px spacing
    }
  }

  /**
   * Unlock a skill for a user (if prerequisites are met)
   */
  static async unlockSkill(userId: string, skillId: string): Promise<{
    success: boolean
    message: string
    newlyUnlocked?: string[]
  }> {
    // Get skill details
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single()

    if (skillError || !skill) {
      return { success: false, message: 'Skill not found' }
    }

    // Check if already unlocked
    const { data: userSkill } = await supabase
      .from('user_skills')
      .select('is_unlocked')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single()

    if (userSkill?.is_unlocked) {
      return { success: false, message: 'Skill already unlocked' }
    }

    // Check prerequisites
    const prerequisites = (skill.prerequisites as string[]) || []
    if (prerequisites.length > 0) {
      const { data: prereqSkills } = await supabase
        .from('user_skills')
        .select('is_unlocked, level')
        .eq('user_id', userId)
        .in('skill_id', prerequisites)

      const unmetPrereqs = prereqSkills?.filter(ps => !ps.is_unlocked || ps.level === 0) || []
      if (unmetPrereqs.length > 0) {
        return { success: false, message: 'Prerequisites not met' }
      }
    }

    // Unlock the skill
    const { error: unlockError } = await supabase
      .from('user_skills')
      .upsert({
        user_id: userId,
        skill_id: skillId,
        level: 1,
        skill_points: skill.points_per_level,
        is_unlocked: true,
        unlocked_at: new Date().toISOString()
      })

    if (unlockError) {
      return { success: false, message: 'Failed to unlock skill' }
    }

    // Check for cascade unlocks
    const newlyUnlocked = await this.checkCascadeUnlocks(userId, skillId)

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Skill Unlocked!',
        message: `You've unlocked the "${skill.name}" skill!`,
        type: 'skill_unlock',
        data: {
          skill_id: skillId,
          skill_name: skill.name,
          newly_unlocked: newlyUnlocked
        }
      })

    return {
      success: true,
      message: 'Skill unlocked successfully',
      newlyUnlocked
    }
  }

  /**
   * Check for skills that can now be unlocked due to new skill unlock
   */
  private static async checkCascadeUnlocks(userId: string, unlockedSkillId: string): Promise<string[]> {
    const newlyUnlocked: string[] = []

    // Get all skills that have this skill as a prerequisite
    const { data: dependentSkills } = await supabase
      .from('skills')
      .select('id, name, prerequisites')
      .contains('prerequisites', [unlockedSkillId])

    if (!dependentSkills) return newlyUnlocked

    for (const skill of dependentSkills) {
      const prerequisites = (skill.prerequisites as string[]) || []
      
      // Check if all prerequisites are now met
      const { data: prereqSkills } = await supabase
        .from('user_skills')
        .select('is_unlocked, level')
        .eq('user_id', userId)
        .in('skill_id', prerequisites)

      const allMet = prereqSkills?.every(ps => ps.is_unlocked && ps.level > 0) || false

      if (allMet) {
        // Check if not already unlocked
        const { data: userSkill } = await supabase
          .from('user_skills')
          .select('is_unlocked')
          .eq('user_id', userId)
          .eq('skill_id', skill.id)
          .single()

        if (!userSkill?.is_unlocked) {
          await supabase
            .from('user_skills')
            .upsert({
              user_id: userId,
              skill_id: skill.id,
              level: 0,
              skill_points: 0,
              is_unlocked: true,
              unlocked_at: new Date().toISOString()
            })

          newlyUnlocked.push(skill.id)
        }
      }
    }

    return newlyUnlocked
  }

  /**
   * Get skill recommendations for a user based on their progress and goals
   */
  static async getSkillRecommendations(userId: string, limit = 5): Promise<{
    skill: SkillTreeNode
    reason: string
    priority: number
  }[]> {
    const skillTree = await this.getUserSkillTree(userId)
    const recommendations: Array<{ skill: SkillTreeNode; reason: string; priority: number }> = []

    for (const category of skillTree.categories) {
      for (const skill of category.skills) {
        if (skill.isUnlocked && skill.level < skill.maxLevel) {
          // Recommend advancing current skills
          recommendations.push({
            skill,
            reason: `Continue advancing your ${skill.name} skills`,
            priority: 3 + skill.level // Higher priority for higher level skills
          })
        } else if (!skill.isUnlocked) {
          // Check if prerequisites are close to being met
          const prereqsMet = skill.prerequisites.every(prereqId => {
            const prereqSkill = category.skills.find(s => s.id === prereqId)
            return prereqSkill?.isUnlocked && prereqSkill.level > 0
          })

          if (prereqsMet) {
            recommendations.push({
              skill,
              reason: `Ready to unlock - all prerequisites met`,
              priority: 5
            })
          } else if (skill.prerequisites.length === 0) {
            recommendations.push({
              skill,
              reason: `Great starting skill for ${category.name}`,
              priority: 2
            })
          }
        }
      }
    }

    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  }

  /**
   * Initialize default skills and categories for new users
   */
  static async initializeDefaultSkillTree(): Promise<void> {
    // Check if skill tree is already initialized
    const { data: existingCategories } = await supabase
      .from('skill_categories')
      .select('id')
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      return // Already initialized
    }

    // Create default skill categories
    const categories = [
      {
        name: 'Frontend Development',
        description: 'Master the art of creating beautiful user interfaces',
        icon: 'Code',
        color: 'bg-blue-500',
        max_skill_points: 3000
      },
      {
        name: 'Backend Development',
        description: 'Build robust server-side applications',
        icon: 'Server',
        color: 'bg-green-500',
        max_skill_points: 3000
      },
      {
        name: 'AI & Machine Learning',
        description: 'Explore the future of intelligent systems',
        icon: 'Brain',
        color: 'bg-purple-500',
        max_skill_points: 3000
      },
      {
        name: 'DevOps & Infrastructure',
        description: 'Deploy and maintain production systems',
        icon: 'Zap',
        color: 'bg-orange-500',
        max_skill_points: 3000
      },
      {
        name: 'Mobile Development',
        description: 'Create applications for mobile devices',
        icon: 'Smartphone',
        color: 'bg-pink-500',
        max_skill_points: 3000
      }
    ]

    const { data: createdCategories, error: categoryError } = await supabase
      .from('skill_categories')
      .insert(categories)
      .select()

    if (categoryError) throw categoryError

    // Create default skills for each category
    const skills = [
      // Frontend Skills
      {
        category_id: createdCategories[0].id,
        name: 'HTML & CSS Fundamentals',
        description: 'Master the building blocks of web development',
        max_level: 5,
        points_per_level: 100,
        prerequisites: [],
        icon: 'Code',
        color: 'bg-blue-400'
      },
      {
        category_id: createdCategories[0].id,
        name: 'JavaScript Mastery',
        description: 'Become proficient in modern JavaScript',
        max_level: 5,
        points_per_level: 150,
        prerequisites: [], // Will be set after skills are created
        icon: 'Code',
        color: 'bg-yellow-500'
      },
      {
        category_id: createdCategories[0].id,
        name: 'React Development',
        description: 'Build dynamic user interfaces with React',
        max_level: 5,
        points_per_level: 200,
        prerequisites: [], // Will be set after skills are created
        icon: 'Code',
        color: 'bg-blue-600'
      },
      {
        category_id: createdCategories[0].id,
        name: 'TypeScript',
        description: 'Add type safety to your JavaScript code',
        max_level: 5,
        points_per_level: 150,
        prerequisites: [], // Will be set after skills are created
        icon: 'Code',
        color: 'bg-blue-700'
      },
      
      // Backend Skills
      {
        category_id: createdCategories[1].id,
        name: 'Node.js Fundamentals',
        description: 'Build server-side applications with Node.js',
        max_level: 5,
        points_per_level: 150,
        prerequisites: [],
        icon: 'Server',
        color: 'bg-green-400'
      },
      {
        category_id: createdCategories[1].id,
        name: 'Database Design',
        description: 'Design and optimize database schemas',
        max_level: 5,
        points_per_level: 200,
        prerequisites: [],
        icon: 'Database',
        color: 'bg-green-600'
      },
      {
        category_id: createdCategories[1].id,
        name: 'API Development',
        description: 'Create RESTful and GraphQL APIs',
        max_level: 5,
        points_per_level: 250,
        prerequisites: [], // Will be set after skills are created
        icon: 'Server',
        color: 'bg-green-700'
      },
      
      // AI/ML Skills
      {
        category_id: createdCategories[2].id,
        name: 'Python for AI',
        description: 'Master Python for machine learning',
        max_level: 5,
        points_per_level: 150,
        prerequisites: [],
        icon: 'Brain',
        color: 'bg-purple-400'
      },
      {
        category_id: createdCategories[2].id,
        name: 'Machine Learning Basics',
        description: 'Understand core ML concepts and algorithms',
        max_level: 5,
        points_per_level: 200,
        prerequisites: [], // Will be set after skills are created
        icon: 'Brain',
        color: 'bg-purple-600'
      },
      {
        category_id: createdCategories[2].id,
        name: 'Deep Learning',
        description: 'Build and train neural networks',
        max_level: 5,
        points_per_level: 300,
        prerequisites: [], // Will be set after skills are created
        icon: 'Brain',
        color: 'bg-purple-800'
      }
    ]

    await supabase
      .from('skills')
      .insert(skills)
  }

  /**
   * Award skill points and handle level progression
   */
  static async awardSkillPoints(
    userId: string,
    skillRewards: Record<string, number>,
    sourceType: 'quest_completion' | 'achievement' | 'bonus' = 'quest_completion',
    sourceId?: string
  ): Promise<{
    success: boolean
    levelUps: Array<{ skillId: string; skillName: string; newLevel: number }>
    newlyUnlocked: string[]
  }> {
    const levelUps: Array<{ skillId: string; skillName: string; newLevel: number }> = []
    const newlyUnlocked: string[] = []

    for (const [skillName, points] of Object.entries(skillRewards)) {
      // Find skill by name
      const { data: skill } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', `%${skillName}%`)
        .single()

      if (!skill) continue

      // Get or create user skill
      const { data: userSkill } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skill.id)
        .single()

      const currentPoints = userSkill?.skill_points || 0
      const currentLevel = userSkill?.level || 0
      const newPoints = currentPoints + points
      const newLevel = Math.min(
        Math.floor(newPoints / skill.points_per_level),
        skill.max_level
      )

      // Update or insert user skill
      const { error } = await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skill.id,
          skill_points: newPoints,
          level: newLevel,
          is_unlocked: true,
          unlocked_at: userSkill?.unlocked_at || new Date().toISOString()
        })

      if (error) continue

      // Record transaction
      if (sourceId) {
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

      // Check for level up
      if (newLevel > currentLevel) {
        levelUps.push({
          skillId: skill.id,
          skillName: skill.name,
          newLevel
        })
      }

      // Check for cascade unlocks
      const cascadeUnlocks = await this.checkCascadeUnlocks(userId, skill.id)
      newlyUnlocked.push(...cascadeUnlocks)
    }

    return {
      success: true,
      levelUps,
      newlyUnlocked
    }
  }
}
