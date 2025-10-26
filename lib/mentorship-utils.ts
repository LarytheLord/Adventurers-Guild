// lib/mentorship-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  start_date?: string;
  end_date?: string;
  goals: string[];
  progress: number;
  created_at: string;
  updated_at: string;
  mentor: {
    id: string;
    name: string;
    email: string;
    rank: string;
    xp: number;
    skill_points: number;
  };
  mentee: {
    id: string;
    name: string;
    email: string;
    rank: string;
    xp: number;
    skill_points: number;
  };
}

// Get mentorships for a user
export async function getUserMentorships(
  userId: string, 
  role: 'mentor' | 'mentee',
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
): Promise<Mentorship[]> {
  let params = new URLSearchParams();
  params.append('user_id', userId);
  params.append('role', role);
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/mentorship?${params.toString()}`);
  const result = await response.json();
  
  if (result.success) {
    return result.mentorships || [];
  } else {
    throw new Error(result.error || 'Failed to fetch mentorships');
  }
}

// Request a mentorship
export async function requestMentorship(
  mentorId: string,
  menteeId: string, // The person requesting to be mentored
  goals: string[]
): Promise<Mentorship | null> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentor_id: mentorId,
        mentee_id: menteeId,
        goals
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.mentorship;
    } else {
      throw new Error(result.error || 'Failed to request mentorship');
    }
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    throw new Error('Failed to request mentorship');
  }
}

// Update mentorship status
export async function updateMentorshipStatus(
  mentorshipId: string,
  currentUserId: string,
  action: 'approve' | 'reject' | 'complete' | 'terminate'
): Promise<Mentorship | null> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentorship_id: mentorshipId,
        current_user_id: currentUserId,
        action
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.mentorship;
    } else {
      throw new Error(result.error || `Failed to ${action} mentorship`);
    }
  } catch (error) {
    console.error(`Error ${action}ing mentorship:`, error);
    throw new Error(`Failed to ${action} mentorship`);
  }
}

// Delete a mentorship
export async function deleteMentorship(
  mentorshipId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mentorship_id: mentorshipId,
        current_user_id: currentUserId
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      throw new Error(result.error || 'Failed to delete mentorship');
    }
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    throw new Error('Failed to delete mentorship');
  }
}

// Find potential mentors for a user
export async function findPotentialMentors(
  userId: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  name: string;
  email: string;
  rank: string;
  xp: number;
  skill_points: number;
  primary_skills?: string[];
}>> {
  // In a real implementation, this would use more sophisticated matching logic
  // For now, we'll just return higher-ranked users with similar skills
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      rank,
      xp,
      adventurer_profiles (
        primary_skills
      )
    `)
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Failed to get user profile');
  }

  const rankValues: Record<string, number> = { 'F': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
  const userRankValue = rankValues[user.rank] || 0;

  // Find users with higher rank and similar skills
  const { data: potentialMentors, error: mentorsError } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      rank,
      xp,
      skill_points,
      adventurer_profiles (
        primary_skills
      )
    `)
    .eq('role', 'adventurer')
    .gt('xp', user.xp) // Higher XP generally means higher rank
    .limit(limit);

  if (mentorsError) {
    throw new Error(mentorsError.message);
  }

  // Filter and rank potential mentors based on similarity
  return potentialMentors
    .filter(mentor => {
      // Must have higher rank
      const mentorRankValue = rankValues[mentor.rank] || 0;
      return mentorRankValue > userRankValue;
    })
    .slice(0, limit);
}

// Get mentorship statistics for a user
export async function getMentorshipStats(userId: string): Promise<{
  totalMentorships: number;
  activeMentorships: number;
  completedMentorships: number;
  avgDurationDays: number;
  avgProgress: number;
}> {
  const allMentorships = await getUserMentorships(userId, 'mentor');
  
  const totalMentorships = allMentorships.length;
  const activeMentorships = allMentorships.filter(m => m.status === 'active').length;
  const completedMentorships = allMentorships.filter(m => m.status === 'completed').length;
  
  // Calculate average duration
  const durations = allMentorships
    .filter(m => m.start_date && m.end_date)
    .map(m => {
      const start = new Date(m.start_date!).getTime();
      const end = new Date(m.end_date!).getTime();
      return (end - start) / (1000 * 60 * 60 * 24); // Convert to days
    });
  
  const avgDurationDays = durations.length > 0 
    ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
    : 0;
  
  // Calculate average progress
  const avgProgress = allMentorships.length > 0
    ? allMentorships.reduce((sum, m) => sum + m.progress, 0) / allMentorships.length
    : 0;

  return {
    totalMentorships,
    activeMentorships,
    completedMentorships,
    avgDurationDays,
    avgProgress
  };
}