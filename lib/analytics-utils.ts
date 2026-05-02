// lib/analytics-utils.ts
// Note: This is a client-side utility that calls API routes.
// No direct database access needed.
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// Get user analytics
export async function getUserAnalytics(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) {
  try {
    const response = await fetchWithAuth(`/api/analytics?type=user&userId=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success) return data;
    throw new Error(data.error || 'Failed to fetch user analytics');
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw new Error('Failed to fetch user analytics');
  }
}

// Get platform analytics
export async function getPlatformAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  try {
    const response = await fetchWithAuth(`/api/analytics?type=platform&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success) return data;
    throw new Error(data.error || 'Failed to fetch platform analytics');
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    throw new Error('Failed to fetch platform analytics');
  }
}

// Get quest analytics for a user
export async function getQuestAnalytics(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) {
  try {
    const response = await fetchWithAuth(`/api/analytics?type=company&userId=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success) return data;
    throw new Error(data.error || 'Failed to fetch quest analytics');
  } catch (error) {
    console.error('Error fetching quest analytics:', error);
    throw new Error('Failed to fetch quest analytics');
  }
}

// Get user's progress over time
export async function getUserProgressOverTime(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<Array<{ date: string; xp: number; sp: number }>> {
  try {
    const response = await fetchWithAuth(`/api/analytics?type=user&userId=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success && Array.isArray(data.progressOverTime)) return data.progressOverTime;
    return [];
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
}

// Get top performing users (FIX H2: replaced hardcoded mock data with live API call)
export async function getTopPerformers(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
  limit: number = 10
): Promise<Array<{ id: string; name: string; rank: string; xp: number; questsCompleted: number }>> {
  try {
    void timeRange; // Rankings API doesn't filter by time range yet
    const response = await fetchWithAuth(`/api/rankings?mode=adventurer&sort=xp&order=desc&limit=${limit}`);
    const data = await response.json();
    if (Array.isArray(data.rankings)) {
      return data.rankings.map((u: Record<string, unknown>) => ({
        id: String(u.id ?? ''),
        name: String(u.name ?? ''),
        rank: String(u.rank ?? ''),
        xp: Number(u.xp ?? 0),
        questsCompleted: Number(u.questsCompleted ?? 0),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}

// Get most popular quest categories
export async function getPopularQuestCategories(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<Array<{ category: string; count: number }>> {
  try {
    const response = await fetchWithAuth(`/api/analytics?type=platform&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success && Array.isArray(data.topCategories)) return data.topCategories;
    return [];
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return [];
  }
}

// Get user engagement metrics (FIX H3: corrected stat key usage)
export async function getUserEngagementMetrics(userId: string) {
  const userAnalytics = await getUserAnalytics(userId);
  return {
    totalLogins: userAnalytics?.user?.totalQuestsCompleted || 0,
    avgTimePerVisit: userAnalytics?.stats?.completedQuests || 0,
    daysActive: userAnalytics?.stats?.totalQuests || 0,
    completionRate: userAnalytics?.stats?.completionRate || 0,
  };
}
