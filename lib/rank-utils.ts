// lib/rank-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface RankingUser {
  id: string;
  name: string;
  email: string;
  rank: string;
  xp: number;
  skill_points: number;
  level: number;
  position: number;
  adventurer_profiles?: {
    specialization?: string;
    quest_completion_rate?: number;
    total_quests_completed?: number;
  };
}

export interface RankingsParams {
  sort?: 'xp' | 'level' | 'skill_points';
  order?: 'asc' | 'desc';
  limit?: string;
  rank?: string;
}

// Fetch rankings
export async function fetchRankings(params: RankingsParams = {}): Promise<RankingUser[]> {
  const { sort = 'xp', order = 'desc', limit = '20', rank } = params;
  
  let query = supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      rank,
      xp,
      skill_points,
      level,
      adventurer_profiles (
        specialization,
        quest_completion_rate,
        total_quests_completed
      )
    `)
    .eq('role', 'adventurer')
    .eq('is_active', true)
    .order(sort, { ascending: order === 'asc' });

  if (rank) {
    query = query.eq('rank', rank);
  }

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rankings:', error);
    throw new Error('Failed to fetch rankings');
  }

  // Add position to the data and handle array access issues
  const rankedData = data.map((user: any, index) => {
    const profileData = Array.isArray(user.adventurer_profiles) ? user.adventurer_profiles[0] : user.adventurer_profiles;
    return {
      ...user,
      adventurer_profiles: profileData || {},
      position: index + 1
    };
  });

  return rankedData as RankingUser[];
}

// Calculate user's current rank based on XP
export async function getUserRank(userId: string): Promise<{ position: number; totalUsers: number } | null> {
  try {
    // First get the user's XP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // Get total number of active adventurers
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'adventurer')
      .eq('is_active', true);

    if (countError) {
      console.error('Error fetching user count:', countError);
      return null;
    }

    // Get user's position by counting users with higher XP
    const { count: position, error: positionError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'adventurer')
      .eq('is_active', true)
      .gt('xp', user.xp);

    if (positionError) {
      console.error('Error fetching position:', positionError);
      return null;
    }

    return {
      position: (position || 0) + 1, // +1 because position is 1-indexed
      totalUsers: totalUsers || 0
    };
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return null;
  }
}

// Re-export centralized rank utilities
export { getRankForXp as getNextRankFn, getNextRankThreshold, getRankProgressPercent } from './ranks';
import { getNextRankThreshold, getRankProgressPercent } from './ranks';

// Calculate the next rank based on current XP
export function getNextRank(currentXp: number): { rank: string; nextRankXp: number } {
  const { currentRank, nextRankXp } = getNextRankThreshold(currentXp);
  return { rank: currentRank, nextRankXp };
}

// Calculate XP needed for next rank
export function getXpToNextRank(currentXp: number): number {
  const { nextRankXp } = getNextRankThreshold(currentXp);
  return nextRankXp > 0 ? nextRankXp - currentXp : 0;
}

// Calculate rank progress percentage
export function getRankProgress(currentXp: number): number {
  return getRankProgressPercent(currentXp);
}