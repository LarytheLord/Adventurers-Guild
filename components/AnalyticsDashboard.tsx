// components/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Target,
  TrendingUp,
  Users,
  Trophy,
  Activity,
  Star,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// Types
interface AnalyticsData {
  user?: {
    id: string;
    name: string;
    rank: string;
    xp: number;
    skillPoints: number;
    level: number;
    specialization?: string;
    primarySkills?: string[];
    questCompletionRate?: number;
    totalQuestsCompleted?: number;
    currentStreak?: number;
    maxStreak?: number;
    joinDate: string;
    lastLogin?: string;
  };
  stats?: {
    totalQuests?: number;
    completedQuests?: number;
    completionRate: number;
    xpGained?: number;
    skillPointsGained?: number;
    activeQuests?: number;
    totalApplicants?: number;
    totalCompletions?: number;
    avgCompletionTime?: number;
  };
  recentActivity?: Array<{
    id: string;
    questId: string;
    completionDate: string;
    xpEarned: number;
    skillPointsEarned: number;
    qualityScore?: number;
    quests: {
      title: string;
      difficulty: string;
      questCategory: string;
    };
  }>;
  progressOverTime?: Array<{
    date: string;
    xp: number;
    sp: number;
  }>;
  platformStats?: {
    totalUsers: number;
    totalQuests: number;
    totalAssignments: number;
    totalCompletions: number;
    activeUsers: number;
    completionRate: number;
  };
  topCategories?: Array<{
    category: string;
    count: number;
  }>;
  rankDistribution?: Array<{
    rank: string;
    count: number;
  }>;
  quests?: Record<string, unknown>[];
  questsStats?: Record<string, unknown>;
  success: boolean;
}

interface AnalyticsDashboardProps {
  userId: string;
  reportType: 'user' | 'company' | 'quest' | 'platform';
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function AnalyticsDashboard({ 
  userId, 
  reportType = 'user', 
  timeRange = '30d' 
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(timeRange);
  const apiReportType = reportType === 'quest' ? 'company' : reportType;

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/analytics?type=${apiReportType}&userId=${userId}&time_range=${selectedTimeRange}`);
        const data = await response.json();
        
        if (data.success) {
          setAnalyticsData(data);
        } else {
          console.error('Error fetching analytics:', data.error);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    }
  }, [apiReportType, userId, selectedTimeRange]);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-green-500';
      case 'D': return 'text-gray-500';
      case 'E': return 'text-purple-500';
      case 'F': return 'text-gray-300';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData || !analyticsData.success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">
            Unable to load analytics data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            {apiReportType === 'user' 
              ? 'Your personal performance metrics' 
              : apiReportType === 'company'
              ? 'Quest performance and delivery metrics'
              : 'Platform-wide performance metrics'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <button
              key={range}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedTimeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {reportType === 'user' && analyticsData.user && analyticsData.stats && (
        <>
          {/* User Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getRankColor(analyticsData.user.rank)}`}>
                  {analyticsData.user.rank}
                </div>
                <p className="text-xs text-muted-foreground">
                  Level {analyticsData.user.level}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.user.xp.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.stats.xpGained} in period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skill Points</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.user.skillPoints.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.stats.skillPointsGained} in period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.user.questCompletionRate?.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.stats.completedQuests}/{analyticsData.stats.totalQuests} quests
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Charts */}
          {analyticsData.progressOverTime && analyticsData.progressOverTime.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>
                  XP and Skill Points gained during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.progressOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value) => [value, 'Points']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="xp" 
                        name="XP Gained" 
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sp" 
                        name="Skill Points" 
                        stroke="#10b981" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {analyticsData.recentActivity && analyticsData.recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest quest completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{activity.quests.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className={getRankColor(activity.quests.difficulty)}>
                            {activity.quests.difficulty}-Rank
                          </span>
                          <span>{activity.quests.questCategory}</span>
                          <span>{format(new Date(activity.completionDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">+{activity.xpEarned} XP</div>
                        <div className="text-sm text-muted-foreground">+{activity.skillPointsEarned} SP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {apiReportType === 'company' && analyticsData.stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.stats.totalQuests ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.stats.activeQuests ?? 0} currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.stats.totalApplicants ?? 0}</div>
              <p className="text-xs text-muted-foreground">Across all company quests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.stats.totalCompletions ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Completion rate: {analyticsData.stats.completionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.stats.avgCompletionTime ?? 0}d</div>
              <p className="text-xs text-muted-foreground">Average turnaround for completed work</p>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'platform' && analyticsData.platformStats && (
        <>
          {/* Platform Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.platformStats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active users: {analyticsData.platformStats.activeUsers}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.platformStats.totalQuests.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assignments: {analyticsData.platformStats.totalAssignments}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.platformStats.totalCompletions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completion Rate: {analyticsData.platformStats.completionRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.platformStats.activeUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {analyticsData.platformStats.totalUsers} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            {analyticsData.topCategories && analyticsData.topCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Quest Categories</CardTitle>
                  <CardDescription>Most popular quest types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.topCategories}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="category" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Quests" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rank Distribution */}
            {analyticsData.rankDistribution && analyticsData.rankDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rank Distribution</CardTitle>
                  <CardDescription>How users are distributed across ranks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.rankDistribution}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rank" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Users" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
