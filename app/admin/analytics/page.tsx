'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApiFetch } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GuildKpi } from '@/components/guild/primitives';
import { Loader2, Users, Target, Activity, TrendingUp, Clock, FileCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsData {
  users: {
    total: number;
    active7d: number;
    active30d: number;
    new7d: number;
    byRole: Record<string, number>;
    rankDistribution: Record<string, number>;
  };
  quests: {
    total: number;
    available: number;
    inProgress: number;
    submitted: number;
    completed: number;
    completionRate: number;
    avgTimeToComplete: number;
    byTrack: Record<string, number>;
    byDifficulty: Record<string, number>;
  };
  activity: {
    dailyActiveUsers: { date: string; count: number }[];
    dailyQuestCompletions: { date: string; count: number }[];
    dailySignups: { date: string; count: number }[];
  };
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const shouldFetch = status === 'authenticated' && session?.user?.role === 'admin';

  const { data, loading, error } = useApiFetch<AnalyticsData>('/api/admin/analytics', {
    skip: !shouldFetch,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [router, session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex
      items-center justify-center bg-background text-destructive">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const rankData = Object.entries(data.users.rankDistribution).map(([rank, count]) => ({
    rank,
    count,
  })).sort((a, b) => b.count - a.count);

  const combinedActivityData = data.activity.dailyActiveUsers.map((dau) => {
    const completions = data.activity.dailyQuestCompletions.find(c => c.date === dau.date)?.count || 0;
    const signups = data.activity.dailySignups.find(s => s.date === dau.date)?.count || 0;
    return {
      date: dau.date.split('-').slice(1).join('/'), // MM/DD
      activeUsers: dau.count,
      completions,
      signups
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform health and KPIs</p>
        </div>

        {/* Top-Level KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GuildKpi>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.users.active30d}</div>
                <p className="text-xs text-muted-foreground">Out of {data.users.total} total</p>
              </CardContent>
            </Card>
          </GuildKpi>
          <GuildKpi>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users (7d)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.users.new7d}</div>
              </CardContent>
            </Card>
          </GuildKpi>
          <GuildKpi>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quest Completion Rate</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.quests.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{data.quests.completed} total completed</p>
              </CardContent>
            </Card>
          </GuildKpi>
          <GuildKpi>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.quests.avgTimeToComplete.toFixed(1)} days</div>
              </CardContent>
            </Card>
          </GuildKpi>
        </div>

        <div className="grid gap-8 lh:grid-cols-2">
          {/* Daily Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity (30 Days)</CardTitle>
              <CardDescription>Daily active users, completions, and signups</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedActivityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rank Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rank Distribution</CardTitle>
              <CardDescription>User counts by Adventurer Rank</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                  <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="rank" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quest Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Pipeline</CardTitle>
              <CardDescription>Current status of all platform quests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Available', value: data.quests.available, color: 'bg-blue-500' },
                  { label: 'In Progress', value: data.quests.inProgress, color: 'bg-amber-500' },
                  { label: 'Submitted (Review)', value: data.quests.submitted, color: 'bg-purple-500' },
                  { label: 'Completed', value: data.quests.completed, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Demographics</CardTitle>
              <CardDescription>User accounts by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{role}</span>
                    <span className="text-sm font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
