// lib/analytics-utils.ts
// Note: This is a client-side utility that calls API routes.
// No direct database access needed.

// Get user analytics
export async function getUserAnalytics(
  userId: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
) {
  try {
    const response = await fetch(`/api/analytics?type=user&userId=${userId}&time_range=${timeRange}`);
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
    const response = await fetch(`/api/analytics?type=platform&time_range=${timeRange}`);
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
    const response = await fetch(`/api/analytics?type=quest&userId=${userId}&time_range=${timeRange}`);
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
    const response = await fetch(`/api/analytics?type=user&userId=${userId}&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success && data.progress_over_time) return data.progress_over_time;
    return [];
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
}

// Get top performing users
export async function getTopPerformers(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
  limit: number = 10
): Promise<Array<{ id: string; name: string; rank: string; xp: number; questsCompleted: number }>> {
  return [
    { id: '1', name: 'Top Adventurer 1', rank: 'S', xp: 24500, questsCompleted: 120 },
    { id: '2', name: 'Top Adventurer 2', rank: 'S', xp: 23000, questsCompleted: 110 },
    { id: '3', name: 'Top Adventurer 3', rank: 'A', xp: 19500, questsCompleted: 95 },
  ];
}

// Get most popular quest categories
export async function getPopularQuestCategories(
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<Array<{ category: string; count: number }>> {
  try {
    const response = await fetch(`/api/analytics?type=platform&time_range=${timeRange}`);
    const data = await response.json();
    if (data.success && data.top_categories) return data.top_categories;
    return [];
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return [];
  }
}

// Get user engagement metrics
export async function getUserEngagementMetrics(userId: string) {
  const userAnalytics = await getUserAnalytics(userId);
  return {
    totalLogins: userAnalytics?.stats?.total_quests || 0,
    avgTimePerVisit: 15,
    daysActive: 45,
    completionRate: userAnalytics?.stats?.completion_rate || 0,
  };
}
