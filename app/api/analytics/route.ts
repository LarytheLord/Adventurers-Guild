// app/api/analytics/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const reportType = searchParams.get('type'); // 'user', 'quest', 'platform'
    const timeRange = searchParams.get('time_range') || '30d'; // 7d, 30d, 90d, 1y
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate user ID if report type requires it
    if (reportType !== 'platform' && !userId) {
      return Response.json({ error: 'User ID is required for user and quest reports', success: false }, { status: 400 });
    }

    if (reportType === 'user') {
      return await getUserAnalytics(userId!, timeRange, startDate || undefined, endDate || undefined);
    } else if (reportType === 'quest') {
      return await getQuestAnalytics(userId!, timeRange, startDate || undefined, endDate || undefined);
    } else if (reportType === 'platform') {
      return await getPlatformAnalytics(timeRange, startDate || undefined, endDate || undefined);
    } else {
      return Response.json({ error: 'Invalid report type. Use: user, quest, or platform', success: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in analytics API:', error);
    return Response.json({ error: 'Failed to fetch analytics', success: false }, { status: 500 });
  }
}

// Get user-specific analytics
async function getUserAnalytics(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      name,
      role,
      rank,
      xp,
      skill_points,
      level,
      created_at,
      last_login_at,
      adventurer_profiles (
        specialization,
        primary_skills,
        quest_completion_rate,
        total_quests_completed,
        current_streak,
        max_streak
      )
    `)
    .eq('id', userId)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  // Get user's quest statistics
  const { count: totalQuests, error: totalQuestsError } = await supabase
    .from('quest_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('assigned_at', getStartDate(timeRange, startDate))
    .lte('assigned_at', getEndDate(endDate));

  if (totalQuestsError) {
    throw new Error(totalQuestsError.message);
  }

  const { count: completedQuests, error: completedQuestsError } = await supabase
    .from('quest_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('completion_date', getStartDate(timeRange, startDate))
    .lte('completion_date', getEndDate(endDate));

  if (completedQuestsError) {
    throw new Error(completedQuestsError.message);
  }

  // Get recent activity
  const { data: recentActivity, error: activityError } = await supabase
    .from('quest_completions')
    .select(`
      id,
      quest_id,
      completion_date,
      xp_earned,
      skill_points_earned,
      quality_score,
      quests (
        title,
        difficulty,
        quest_category
      )
    `)
    .eq('user_id', userId)
    .gte('completion_date', getStartDate(timeRange, startDate))
    .lte('completion_date', getEndDate(endDate))
    .order('completion_date', { ascending: false })
    .limit(10);

  if (activityError) {
    throw new Error(activityError.message);
  }

  // Calculate progress over time
  const progressData = await getProgressData(userId, timeRange, startDate, endDate);

  const profile: any = Array.isArray(user.adventurer_profiles) ? user.adventurer_profiles[0] : user.adventurer_profiles;
  
  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      rank: user.rank,
      xp: user.xp,
      skill_points: user.skill_points,
      level: user.level,
      specialization: profile?.specialization,
      primary_skills: profile?.primary_skills,
      quest_completion_rate: profile?.quest_completion_rate,
      total_quests_completed: profile?.total_quests_completed,
      current_streak: profile?.current_streak,
      max_streak: profile?.max_streak,
      join_date: user.created_at,
      last_login: user.last_login_at
    },
    stats: {
      total_quests: totalQuests || 0,
      completed_quests: completedQuests || 0,
      completion_rate: totalQuests ? (completedQuests || 0) / totalQuests * 100 : 0,
      xp_gained: recentActivity.reduce((sum, item) => sum + item.xp_earned, 0),
      skill_points_gained: recentActivity.reduce((sum, item) => sum + item.skill_points_earned, 0)
    },
    recent_activity: recentActivity,
    progress_over_time: progressData,
    success: true
  });
}

// Get quest-specific analytics
async function getQuestAnalytics(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get quests created by the user (if company) or assigned to user (if adventurer)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  let quests;
  let questStats;

  if (user.role === 'company') {
    // Get quests posted by company
    const { data: companyQuests, error: questsError } = await supabase
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
        max_participants,
        quest_category,
        created_at,
        deadline,
        assigned_count:quest_assignments(count),
        completed_count:quest_completions(count)
      `)
      .eq('company_id', userId)
      .gte('created_at', getStartDate(timeRange, startDate))
      .lte('created_at', getEndDate(endDate))
      .order('created_at', { ascending: false });

    if (questsError) {
      throw new Error(questsError.message);
    }

    quests = companyQuests;

    // Calculate company quest statistics
    const totalReward = companyQuests.reduce((sum, quest) => sum + (quest.monetary_reward || 0), 0);
    const totalAssigned = companyQuests.reduce((sum, quest) => sum + (quest.assigned_count[0]?.count || 0), 0);
    const totalCompleted = companyQuests.reduce((sum, quest) => sum + (quest.completed_count[0]?.count || 0), 0);

    questStats = {
      total_quests: companyQuests.length,
      total_reward_spent: totalReward,
      total_assigned: totalAssigned,
      total_completed: totalCompleted,
      completion_rate: totalAssigned ? (totalCompleted / totalAssigned) * 100 : 0
    };
  } else {
    // Get quests assigned to adventurer
    const { data: adventurerQuests, error: questsError } = await supabase
      .from('quest_assignments')
      .select(`
        id,
        quest_id,
        status,
        assigned_at,
        started_at,
        completed_at,
        progress,
        quests (
          id,
          title,
          description,
          quest_type,
          status,
          difficulty,
          xp_reward,
          skill_points_reward,
          required_skills,
          quest_category
        )
      `)
      .eq('user_id', userId)
      .gte('assigned_at', getStartDate(timeRange, startDate))
      .lte('assigned_at', getEndDate(endDate))
      .order('assigned_at', { ascending: false });

    if (questsError) {
      throw new Error(questsError.message);
    }

    quests = adventurerQuests;

    // Calculate adventurer quest statistics
    const completed = adventurerQuests.filter(q => q.status === 'completed').length;
    const inProgress = adventurerQuests.filter(q => q.status === 'in_progress').length;
    const xpEarned = adventurerQuests.reduce((sum, quest) => {
      if (quest.status === 'completed' && quest.quests) {
        const questData: any = Array.isArray(quest.quests) ? quest.quests[0] : quest.quests;
        return sum + (questData?.xp_reward || 0);
      }
      return sum;
    }, 0);

    questStats = {
      total_quests: adventurerQuests.length,
      completed_quests: completed,
      in_progress_quests: inProgress,
      xp_earned: xpEarned,
      completion_rate: adventurerQuests.length ? (completed / adventurerQuests.length) * 100 : 0
    };
  }

  return Response.json({
    quests,
    stats: questStats,
    success: true
  });
}

// Get platform-wide analytics
async function getPlatformAnalytics(timeRange: string, startDate?: string, endDate?: string) {
  // Get overall platform statistics
  const { count: totalUsers, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', getStartDate(timeRange, startDate))
    .lte('created_at', getEndDate(endDate));

  if (usersError) {
    throw new Error(usersError.message);
  }

  const { count: totalQuests, error: questsError } = await supabase
    .from('quests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', getStartDate(timeRange, startDate))
    .lte('created_at', getEndDate(endDate));

  if (questsError) {
    throw new Error(questsError.message);
  }

  const { count: totalAssignments, error: assignmentsError } = await supabase
    .from('quest_assignments')
    .select('*', { count: 'exact', head: true })
    .gte('assigned_at', getStartDate(timeRange, startDate))
    .lte('assigned_at', getEndDate(endDate));

  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  const { count: totalCompletions, error: completionsError } = await supabase
    .from('quest_completions')
    .select('*', { count: 'exact', head: true })
    .gte('completion_date', getStartDate(timeRange, startDate))
    .lte('completion_date', getEndDate(endDate));

  if (completionsError) {
    throw new Error(completionsError.message);
  }

  // Get active users in the time period
  const { data: activeUsers, error: activeError } = await supabase
    .from('users')
    .select('id')
    .gte('last_login_at', getStartDate(timeRange, startDate))
    .lte('last_login_at', getEndDate(endDate));

  if (activeError) {
    throw new Error(activeError.message);
  }

  // Get top categories
  const { data: topCategories, error: categoryError } = await supabase
    .rpc('get_top_quest_categories', { 
      start_date: getStartDate(timeRange, startDate),
      end_date: getEndDate(endDate)
    });

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  // Get rank distribution - Supabase doesn't support group(), so we'll fetch and group in JS
  const { data: allUsers, error: rankError } = await supabase
    .from('users')
    .select('rank')
    .eq('role', 'adventurer')
    .gte('created_at', getStartDate(timeRange, startDate))
    .lte('created_at', getEndDate(endDate));

  if (rankError) {
    throw new Error(rankError.message);
  }

  // Group by rank manually
  const rankDistribution = allUsers?.reduce((acc: any[], user: any) => {
    const existing = acc.find(item => item.rank === user.rank);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ rank: user.rank, count: 1 });
    }
    return acc;
  }, []);

  return Response.json({
    platform_stats: {
      total_users: totalUsers || 0,
      total_quests: totalQuests || 0,
      total_assignments: totalAssignments || 0,
      total_completions: totalCompletions || 0,
      active_users: activeUsers ? activeUsers.length : 0,
      completion_rate: totalAssignments ? (totalCompletions || 0) / totalAssignments * 100 : 0
    },
    top_categories: topCategories,
    rank_distribution: rankDistribution,
    success: true
  });
}

// Helper function to get start date based on time range
function getStartDate(timeRange: string, startDate?: string): string {
  if (startDate) {
    return startDate;
  }

  const now = new Date();
  let start = new Date(now);

  switch (timeRange) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Default to 30 days
      start.setDate(now.getDate() - 30);
  }

  return start.toISOString();
}

// Helper function to get end date
function getEndDate(endDate?: string): string {
  return endDate ? endDate : new Date().toISOString();
}

// Function to calculate progress over time
async function getProgressData(userId: string, timeRange: string, startDate?: string, endDate?: string) {
  // Get daily XP gains over the period
  const { data, error } = await supabase
    .from('quest_completions')
    .select(`
      completion_date,
      xp_earned,
      skill_points_earned
    `)
    .eq('user_id', userId)
    .gte('completion_date', getStartDate(timeRange, startDate))
    .lte('completion_date', getEndDate(endDate))
    .order('completion_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Group by date and sum up XP/Skill Points
  const progressByDate: Record<string, { xp: number; sp: number }> = {};
  data.forEach(item => {
    const date = item.completion_date.split('T')[0]; // Get just the date part
    if (!progressByDate[date]) {
      progressByDate[date] = { xp: 0, sp: 0 };
    }
    progressByDate[date].xp += item.xp_earned;
    progressByDate[date].sp += item.skill_points_earned;
  });

  // Convert to array format for charting
  return Object.entries(progressByDate)
    .map(([date, values]) => ({
      date,
      xp: values.xp,
      sp: values.sp
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}