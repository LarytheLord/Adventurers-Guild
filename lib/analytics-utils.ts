// lib/analytics-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
interface UserAnalytics {
  user: {
    id: string;
    name: string;
    rank: string;
    xp: number;
    skill_points: number;
    level: number;
    specialization?: string;
    primary_skills?: string[];
    quest_completion_rate?: number;
    total_quests_completed?: number;
    current_streak?: number;
    max_streak?: number;
    join_date: string;
    last_login?: string;
  };
  stats: {
    total_quests: number;
    completed_quests: number;
    completion_rate: number;
    xp_gained: number;
    skill_points_gained: number;
  };
  recent_activity: Array<{
    id: string;
    quest_id: string;
    completion_date: string;
    xp_earned: number;
    skill_points_earned: number;
    quality_score?: number;
    quests: {
      title: string;
      difficulty: string;
      quest_category: string;
    };
  }>;
  progress_over_time: Array<{
    date: string;
    xp: number;
    sp: number;
  }>;
}

interface PlatformAnalytics {
  platform_stats: {
    total_users: number;
    total_quests: number;
    total_assignments: number;
    total_completions: number;
    active_users: number;
    completion_rate: number;
  };
  top_categories: Array<{
    category: string;
    count: number;
  }>;
  rank_distribution: Array<{
    rank: string;
    count: number;
  }>;
}

// Get user analytics
export async function getUserAnalytics(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<UserAnalytics | null> {
  try {
    const response = await fetch(`/api/analytics?type=user&user_id=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch user analytics');
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw new Error('Failed to fetch user analytics');
  }
}

// Get platform analytics
export async function getPlatformAnalytics(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<PlatformAnalytics | null> {
  try {
    const response = await fetch(`/api/analytics?type=platform&time_range=${timeRange}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch platform analytics');
    }
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    throw new Error('Failed to fetch platform analytics');
  }
}

// Get quest analytics for a user
export async function getQuestAnalytics(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<any> {
  try {
    const response = await fetch(`/api/analytics?type=quest&user_id=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch quest analytics');
    }
  } catch (error) {
    console.error('Error fetching quest analytics:', error);
    throw new Error('Failed to fetch quest analytics');
  }
}

// Get user's progress over time
export async function getUserProgressOverTime(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<Array<{date: string; xp: number; sp: number}>> {
  try {
    const response = await fetch(`/api/analytics?type=user&user_id=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    
    if (data.success && data.progress_over_time) {
      return data.progress_over_time;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
}

// Get top performing users
export async function getTopPerformers(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
  limit: number = 10
): Promise<Array<{
  id: string;
  name: string;
  rank: string;
  xp: number;
  questsCompleted: number;
}>> {
  try {
    // In a real implementation, this would call an API endpoint
    // For now, we'll return mock data
    return [
      { id: '1', name: 'Top Adventurer 1', rank: 'S', xp: 24500, questsCompleted: 120 },
      { id: '2', name: 'Top Adventurer 2', rank: 'S', xp: 23000, questsCompleted: 110 },
      { id: '3', name: 'Top Adventurer 3', rank: 'A', xp: 19500, questsCompleted: 95 },
      { id: '4', name: 'Top Adventurer 4', rank: 'A', xp: 18000, questsCompleted: 85 },
      { id: '5', name: 'Top Adventurer 5', rank: 'A', xp: 16500, questsCompleted: 80 }
    ];
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}

// Get most popular quest categories
export async function getPopularQuestCategories(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<Array<{category: string; count: number}>> {
  try {
    const response = await fetch(`/api/analytics?type=platform&time_range=${timeRange}`);
    const data = await response.json();
    
    if (data.success && data.top_categories) {
      return data.top_categories;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return [];
  }
}

// Get user engagement metrics
export async function getUserEngagementMetrics(userId: string): Promise<{
  totalLogins: number;
  avgTimePerVisit: number; // in minutes
  daysActive: number;
  completionRate: number;
}> {
  // In a real implementation, this would track user behavior
  // For now, we'll return mock data based on user stats
  const userAnalytics = await getUserAnalytics(userId);
  
  return {
    totalLogins: userAnalytics?.stats.total_quests || 0, // Using quests as proxy for engagement
    avgTimePerVisit: 15, // Mock average
    daysActive: 45, // Mock number
    completionRate: userAnalytics?.stats.completion_rate || 0
  };
}