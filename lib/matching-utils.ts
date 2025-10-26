// lib/matching-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_skills: string[];
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  created_at: string;
  deadline?: string;
  users?: {
    name: string;
    is_verified: boolean;
  };
  matchScore?: number;
  recommendationScore?: number;
}

// Get matched quests for a user
export async function getMatchedQuests(userId: string, limit: number = 10): Promise<Quest[]> {
  try {
    const response = await fetch(`/api/matching?user_id=${userId}&limit=${limit}`);
    const data = await response.json();
    
    if (data.success) {
      return data.matches || [];
    } else {
      throw new Error(data.error || 'Failed to fetch matched quests');
    }
  } catch (error) {
    console.error('Error fetching matched quests:', error);
    throw new Error('Failed to fetch matched quests');
  }
}

// Get AI recommendations for a user
export async function getQuestRecommendations(
  userId: string, 
  numRecommendations: number = 5
): Promise<Quest[]> {
  try {
    const response = await fetch('/api/matching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        num_recommendations: numRecommendations
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.recommendations || [];
    } else {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error('Failed to fetch recommendations');
  }
}

// Calculate match score between a user and a quest
export function calculateMatchScore(
  user: {
    rank: string;
    primary_skills?: string[];
    specialization?: string;
    quest_completion_rate?: number;
    skill_progress?: Array<{ skill_id: string; level: number }>;
  },
  quest: Quest
): number {
  let matchScore = 0;

  // 1. Rank compatibility (0-25 points)
  const rankValues: Record<string, number> = { 'F': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
  const userRankValue = rankValues[user.rank] || 0;
  const questRankValue = rankValues[quest.difficulty] || 0;
  
  if (userRankValue === questRankValue) {
    matchScore += 25;
  } else if (userRankValue >= questRankValue) {
    matchScore += Math.max(0, 25 - (userRankValue - questRankValue) * 5);
  }

  // 2. Skill compatibility (0-35 points)
  if (quest.required_skills && quest.required_skills.length > 0) {
    const userSkills = [
      ...(user.primary_skills || []),
      ...((user.skill_progress || []).map(sp => sp.skill_id))
    ];
    
    const matchingSkills = quest.required_skills.filter((reqSkill: string) => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;
    
    const skillMatchPercentage = matchingSkills / quest.required_skills.length;
    matchScore += skillMatchPercentage * 35;
  } else {
    // If no specific skills required, award full points for this category
    matchScore += 35;
  }

  // 3. Category alignment (0-20 points)
  if (user.specialization && user.specialization.toLowerCase() === quest.quest_category.toLowerCase()) {
    matchScore += 20;
  } else {
    // Partial points if it's in a related category
    const relatedCategories: Record<string, string[]> = {
      'frontend': ['fullstack', 'design'],
      'backend': ['fullstack', 'devops'],
      'fullstack': ['frontend', 'backend'],
      'mobile': ['frontend'],
      'devops': ['backend'],
      'qa': ['backend', 'frontend']
    };
    
    if (user.specialization && relatedCategories[user.specialization.toLowerCase()]?.includes(quest.quest_category.toLowerCase())) {
      matchScore += 10;
    }
  }

  // 4. Quest completion rate bonus (0-20 points)
  if (user.quest_completion_rate !== undefined) {
    matchScore += (user.quest_completion_rate / 100) * 20;
  }

  // 5. Reward attractiveness (0-10 points)
  const avgReward = (quest.xp_reward + (quest.monetary_reward || 0) * 100) / 2; // Convert monetary to XP equivalent
  matchScore += Math.min(10, avgReward / 250); // Scale appropriately

  return Math.round(matchScore);
}

// Get user's profile for matching
export async function getUserProfileForMatching(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      role,
      rank,
      xp,
      skill_points,
      level,
      adventurer_profiles (
        specialization,
        primary_skills,
        quest_completion_rate
      ),
      skill_progress (
        skill_id,
        level,
        experience_points
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }

  return user;
}

// Get available quests for matching
export async function getAvailableQuests(limit: number = 20) {
  const { data: quests, error } = await supabase
    .from('quests')
    .select(`
      id,
      title,
      description,
      quest_type,
      status,
      difficulty,
      xp_reward,
      skill_points_reward,
      monetary_reward,
      required_skills,
      required_rank,
      max_participants,
      quest_category,
      company_id,
      created_at,
      deadline,
      users (
        name,
        is_verified
      )
    `)
    .eq('status', 'available')
    .limit(limit);

  if (error) {
    console.error('Error fetching quests:', error);
    throw new Error('Failed to fetch quests');
  }

  return quests;
}