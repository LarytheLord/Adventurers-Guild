// lib/mentorship-utils.ts
import { prisma } from './db';

// Types
export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  goals: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  mentor: { id: string; name: string; email: string; rank: string; xp: number; skillPoints: number };
  mentee: { id: string; name: string; email: string; rank: string; xp: number; skillPoints: number };
}

// Get mentorships for a user (client-side wrapper)
export async function getUserMentorships(
  userId: string,
  role: 'mentor' | 'mentee',
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
): Promise<Mentorship[]> {
  const params = new URLSearchParams();
  params.append('userId', userId);
  params.append('role', role);
  if (status) params.append('status', status);

  const response = await fetch(`/api/mentorship?${params.toString()}`);
  const result = await response.json();

  if (result.success) return result.mentorships || [];
  throw new Error(result.error || 'Failed to fetch mentorships');
}

// Request a mentorship (client-side wrapper)
export async function requestMentorship(
  mentorId: string,
  menteeId: string,
  goals: string[]
): Promise<Mentorship | null> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorId: mentorId, menteeId: menteeId, goals }),
    });

    const result = await response.json();
    if (result.success) return result.mentorship;
    throw new Error(result.error || 'Failed to request mentorship');
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    throw new Error('Failed to request mentorship');
  }
}

// Update mentorship status (client-side wrapper)
export async function updateMentorshipStatus(
  mentorshipId: string,
  currentUserId: string,
  action: 'approve' | 'reject' | 'complete' | 'terminate'
): Promise<Mentorship | null> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentorshipId: mentorshipId,
        current_userId: currentUserId,
        action,
      }),
    });

    const result = await response.json();
    if (result.success) return result.mentorship;
    throw new Error(result.error || `Failed to ${action} mentorship`);
  } catch (error) {
    console.error(`Error ${action}ing mentorship:`, error);
    throw new Error(`Failed to ${action} mentorship`);
  }
}

// Delete a mentorship (client-side wrapper)
export async function deleteMentorship(mentorshipId: string, currentUserId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/mentorship', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorshipId: mentorshipId, current_userId: currentUserId }),
    });

    const result = await response.json();
    if (result.success) return true;
    throw new Error(result.error || 'Failed to delete mentorship');
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    throw new Error('Failed to delete mentorship');
  }
}

// Find potential mentors for a user
export async function findPotentialMentors(userId: string, limit: number = 5) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rank: true, xp: true },
  });

  if (!user) throw new Error('Failed to get user profile');

  const rankValues: Record<string, number> = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
  const userRankValue = rankValues[user.rank] || 0;

  const potentialMentors = await prisma.user.findMany({
    where: { role: 'adventurer', xp: { gt: user.xp } },
    select: {
      id: true,
      name: true,
      email: true,
      rank: true,
      xp: true,
      skillPoints: true,
      adventurerProfile: { select: { primarySkills: true } },
    },
    take: limit * 2, // Fetch extra to filter
  });

  return potentialMentors
    .filter((m) => {
      const mentorRankValue = rankValues[m.rank] || 0;
      return mentorRankValue > userRankValue;
    })
    .slice(0, limit);
}

// Get mentorship statistics for a user
export async function getMentorshipStats(userId: string) {
  const allMentorships = await getUserMentorships(userId, 'mentor');

  const totalMentorships = allMentorships.length;
  const activeMentorships = allMentorships.filter((m) => m.status === 'active').length;
  const completedMentorships = allMentorships.filter((m) => m.status === 'completed').length;

  const durations = allMentorships
    .filter((m) => m.startDate && m.endDate)
    .map((m) => {
      const start = new Date(m.startDate!).getTime();
      const end = new Date(m.endDate!).getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    });

  const avgDurationDays = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 0;
  const avgProgress =
    allMentorships.length > 0 ? allMentorships.reduce((s, m) => s + m.progress, 0) / allMentorships.length : 0;

  return { totalMentorships, activeMentorships, completedMentorships, avgDurationDays, avgProgress };
}
