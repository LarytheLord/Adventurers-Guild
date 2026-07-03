import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type UserRank = 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
type QuestDifficulty = 'F' | 'D' | 'C' | 'B' | 'A' | 'S'

// Type for the safe_complete_quest function result
interface SafeCompleteQuestResult {
  success: boolean
}

export interface XPCalculationResult {
  baseXP: number
  bonusXP: number
  totalXP: number
  skillPoints: Record<string, number>
  reasoning: string[]
}

export interface RankProgressionResult {
  oldRank: UserRank
  newRank: UserRank
  xpRequired: number
  xpToNextRank: number
  rankedUp: boolean
}

export interface PaymentCalculation {
  questBudget: number
  adventurerPayment: number
  platformFee: number
  feePercentage: number
}

export class BusinessLogicService {
  
  /**
   * Comprehensive XP calculation engine based on multiple factors
   */
  static calculateXP(params: {
    questDifficulty: QuestDifficulty
    questBudget: number
    timeToComplete: number // in hours
    rating: number // 1-5 stars from company
    bonusMultipliers?: {
      firstQuestBonus?: boolean
      streakBonus?: number
      qualityBonus?: boolean
    }
  }): XPCalculationResult {
    const { questDifficulty, questBudget, timeToComplete, rating, bonusMultipliers = {} } = params
    
    // Base XP calculation based on difficulty
    const difficultyMultipliers = {
      'F': 50,   // Entry level
      'D': 100,  // Beginner
      'C': 200,  // Intermediate  
      'B': 400,  // Advanced
      'A': 800,  // Expert
      'S': 1500  // Master
    }
    
    let baseXP = difficultyMultipliers[questDifficulty]
    const reasoning: string[] = []
    
    // Budget-based XP scaling (higher budget = more XP)
    const budgetMultiplier = Math.min(Math.max(questBudget / 1000, 0.5), 3.0)
    baseXP *= budgetMultiplier
    reasoning.push(`Budget scaling: ${budgetMultiplier.toFixed(2)}x (${questBudget} USD)`)
    
    // Time efficiency bonus/penalty
    const expectedHours = this.getExpectedHours(questDifficulty)
    const efficiencyRatio = expectedHours / timeToComplete
    const timeMultiplier = Math.min(Math.max(efficiencyRatio, 0.7), 2.0)
    baseXP *= timeMultiplier
    reasoning.push(`Time efficiency: ${timeMultiplier.toFixed(2)}x (${timeToComplete}h vs ${expectedHours}h expected)`)
    
    // Quality rating impact
    const qualityMultiplier = 0.6 + (rating * 0.2) // 0.8x to 1.6x based on 1-5 rating
    baseXP *= qualityMultiplier
    reasoning.push(`Quality rating: ${qualityMultiplier.toFixed(2)}x (${rating}/5 stars)`)
    
    // Calculate bonus XP
    let bonusXP = 0
    
    if (bonusMultipliers.firstQuestBonus) {
      bonusXP += baseXP * 0.5
      reasoning.push(`First quest bonus: +50%`)
    }
    
    if (bonusMultipliers.streakBonus && bonusMultipliers.streakBonus > 1) {
      const streakMultiplier = Math.min(bonusMultipliers.streakBonus * 0.1, 0.5)
      bonusXP += baseXP * streakMultiplier
      reasoning.push(`Completion streak bonus: +${(streakMultiplier * 100).toFixed(0)}%`)
    }
    
    if (bonusMultipliers.qualityBonus && rating >= 4.5) {
      bonusXP += baseXP * 0.25
      reasoning.push(`High quality bonus: +25%`)
    }
    
    const totalXP = Math.round(baseXP + bonusXP)
    
    // Calculate skill points distribution
    const skillPoints = this.calculateSkillPoints(questDifficulty, totalXP)
    
    return {
      baseXP: Math.round(baseXP),
      bonusXP: Math.round(bonusXP),
      totalXP,
      skillPoints,
      reasoning
    }
  }
  
  /**
   * Calculate expected completion hours based on difficulty
   */
  private static getExpectedHours(difficulty: QuestDifficulty): number {
    const expectedHours = {
      'F': 8,   // 1 day
      'D': 16,  // 2 days
      'C': 40,  // 1 week
      'B': 80,  // 2 weeks
      'A': 160, // 1 month
      'S': 320  // 2 months
    }
    return expectedHours[difficulty]
  }
  
  /**
   * Calculate skill points distribution based on quest type and difficulty
   */
  private static calculateSkillPoints(difficulty: QuestDifficulty, totalXP: number): Record<string, number> {
    const baseSkillPoints = totalXP * 0.6 // 60% of XP becomes skill points
    
    // This would be customized based on quest tags/category
    // For now, return a generic distribution
    return {
      'technical_skills': Math.round(baseSkillPoints * 0.7),
      'problem_solving': Math.round(baseSkillPoints * 0.2),
      'communication': Math.round(baseSkillPoints * 0.1)
    }
  }
  
  /**
   * Calculate rank progression based on current XP
   */
  static calculateRankProgression(currentXP: number, currentRank: UserRank, additionalXP: number): RankProgressionResult {
    const rankThresholds = {
      'F': 0,
      'D': 1000,
      'C': 3000,
      'B': 7500,
      'A': 15000,
      'S': 30000
    }
    
    const ranks: UserRank[] = ['F', 'D', 'C', 'B', 'A', 'S']
    const newTotalXP = currentXP + additionalXP
    
    let newRank = currentRank
    for (const rank of ranks.reverse()) {
      if (newTotalXP >= rankThresholds[rank]) {
        newRank = rank
        break
      }
    }
    
    const currentRankIndex = ranks.indexOf(newRank)
    const nextRank = ranks[currentRankIndex + 1]
    const xpToNextRank = nextRank ? rankThresholds[nextRank] - newTotalXP : 0
    
    return {
      oldRank: currentRank,
      newRank,
      xpRequired: newTotalXP,
      xpToNextRank,
      rankedUp: newRank !== currentRank
    }
  }
  
  /**
   * Calculate payment distribution and platform fees
   */
  static calculatePaymentDistribution(questBudget: number, adventurerRank: UserRank): PaymentCalculation {
    // Platform fee based on quest value and adventurer rank
    const baseFeePercentage = 0.20 // 20% base
    
    // Rank-based fee adjustment (higher ranks = lower fees)
    const rankDiscounts = {
      'F': 0.00,  // No discount
      'D': 0.02,  // 2% discount
      'C': 0.03,  // 3% discount
      'B': 0.04,  // 4% discount
      'A': 0.05,  // 5% discount
      'S': 0.07   // 7% discount
    }
    
    const adjustedFeePercentage = Math.max(baseFeePercentage - rankDiscounts[adventurerRank], 0.10) // Minimum 10% fee
    const platformFee = questBudget * adjustedFeePercentage
    const adventurerPayment = questBudget - platformFee
    
    return {
      questBudget,
      adventurerPayment,
      platformFee,
      feePercentage: adjustedFeePercentage
    }
  }
  
  /**
   * Check if adventurer can access quest based on rank requirements
   */
  static canAccessQuest(adventurerRank: UserRank, questDifficulty: QuestDifficulty): boolean {
    const rankValues = { 'F': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 }
    return rankValues[adventurerRank] >= rankValues[questDifficulty]
  }
  
  /**
   * Complete quest and award XP/payments
   */
  static async completeQuest(questId: string, userId: string, completionData: {
    timeToComplete: number
    rating: number
  }): Promise<{
    xpResult: XPCalculationResult
    rankResult: RankProgressionResult
    paymentResult: PaymentCalculation
  }> {
    // Get quest and user data
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()
    
    if (questError) throw questError
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, rank, total_earnings')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    // Check for bonuses
    const { data: userStats, error: statsError } = await supabase
      .from('quest_submissions')
      .select('count')
      .eq('user_id', userId)
      .eq('status', 'approved')
    
    const isFirstQuest = !statsError && (!userStats || userStats.length === 0)
    
    // Calculate XP
    const xpResult = this.calculateXP({
      questDifficulty: quest.difficulty as QuestDifficulty,
      questBudget: quest.budget || 1000,
      timeToComplete: completionData.timeToComplete,
      rating: completionData.rating,
      bonusMultipliers: {
        firstQuestBonus: isFirstQuest,
        qualityBonus: true
      }
    })
    
    // Calculate rank progression
    const rankResult = this.calculateRankProgression(
      user.xp,
      user.rank as UserRank,
      xpResult.totalXP
    )
    
    // Calculate payment
    const paymentResult = this.calculatePaymentDistribution(
      quest.budget || 1000,
      user.rank as UserRank
    )
    
    // Store old values for idempotency check
    const oldXp = user.xp
    const oldRank = user.rank

    // Use atomic database function to prevent XP loss on failure
    const { data: atomicResult, error: atomicError } = await supabase.rpc('safe_complete_quest', {
      p_user_id: userId,
      p_quest_id: questId,
      p_xp_amount: xpResult.totalXP,
      p_new_rank: rankResult.newRank,
      p_payment_amount: paymentResult.adventurerPayment,
      p_old_xp: oldXp,
      p_old_rank: oldRank
    })

    if (atomicError) {
      console.error('Atomic quest completion failed:', atomicError)
      throw new Error('Failed to complete quest. Please try again.')
    }

    if (!atomicResult) {
      throw new Error('Quest completion failed - data may have changed. Please try again.')
    }
    
    // Create notification for rank up
    if (rankResult.rankedUp) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Rank Up!',
          message: `Congratulations! You've been promoted from ${rankResult.oldRank} to ${rankResult.newRank} rank!`,
          type: 'rank_up',
          data: {
            old_rank: rankResult.oldRank,
            new_rank: rankResult.newRank,
            xp_gained: xpResult.totalXP
          }
        })
    }
    
    return {
      xpResult,
      rankResult,
      paymentResult
    }
  }
  
  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(userId: string): Promise<{
    rank: UserRank
    xp: number
    xpToNextRank: number
    completedQuests: number
    totalEarnings: number
    averageRating: number
    successRate: number
  }> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, rank, total_earnings')
      .eq('id', userId)
      .single()
    
    if (userError) throw userError
    
    const { data: submissions, error: submissionsError } = await supabase
      .from('quest_submissions')
      .select('status, rating')
      .eq('user_id', userId)
    
    if (submissionsError) throw submissionsError
    
    const completedQuests = submissions?.filter(s => s.status === 'approved').length || 0
    const totalSubmissions = submissions?.length || 0
    const successRate = totalSubmissions > 0 ? (completedQuests / totalSubmissions) * 100 : 0
    
    const ratings = submissions?.filter(s => s.rating).map(s => s.rating!) || []
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    
    const rankProgression = this.calculateRankProgression(user.xp, user.rank as UserRank, 0)
    
    return {
      rank: user.rank as UserRank,
      xp: user.xp,
      xpToNextRank: rankProgression.xpToNextRank,
      completedQuests,
      totalEarnings: user.total_earnings,
      averageRating,
      successRate
    }
  }
  
  /**
   * Calculate quest recommendation score for an adventurer
   */
  static calculateQuestRecommendationScore(
    adventurerRank: UserRank,
    adventurerSkills: Record<string, number>,
    quest: {
      difficulty: QuestDifficulty
      budget: number
      tags: string[]
      xp_reward: number
    }
  ): number {
    let score = 0
    
    // Difficulty matching (prefer quests at or slightly above current rank)
    const rankDiff = this.getRankDifference(adventurerRank, quest.difficulty)
    if (rankDiff === 0) score += 50 // Perfect match
    else if (rankDiff === 1) score += 30 // One rank higher (growth opportunity)
    else if (rankDiff === -1) score += 20 // One rank lower (confidence builder)
    else score -= Math.abs(rankDiff) * 10 // Penalty for large gaps
    
    // Budget attractiveness (higher budget = higher score)
    score += Math.min(quest.budget / 100, 30)
    
    // XP reward attractiveness
    score += Math.min(quest.xp_reward / 10, 20)
    
    // Skill matching (if adventurer has relevant skills)
    const skillMatches = quest.tags.filter(tag => 
      Object.keys(adventurerSkills).some(skill => 
        skill.toLowerCase().includes(tag.toLowerCase())
      )
    ).length
    score += skillMatches * 10
    
    return Math.max(0, Math.min(100, score))
  }
  
  private static getRankDifference(rank1: UserRank, rank2: QuestDifficulty): number {
    const ranks = ['F', 'D', 'C', 'B', 'A', 'S']
    return ranks.indexOf(rank2) - ranks.indexOf(rank1)
  }
}

// Export alias for backward compatibility
export const BusinessLogic = BusinessLogicService
