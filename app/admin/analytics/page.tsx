'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock3,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GuildCard, GuildHero, GuildKpi, GuildPage, GuildPanel } from '@/components/guild/primitives';

const USER_ROLES = ['adventurer', 'company', 'admin'] as const;
const USER_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;
const QUEST_TRACKS = ['OPEN', 'INTERN', 'BOOTCAMP'] as const;

type CountPoint = {
  date: string;
  count: number;
};

interface AnalyticsResponse {
  success: boolean;
  userMetrics: {
    totalUsers: number;
    activeUsersLast7d: number;
    activeUsersLast30d: number;
    newUsersLast7d: number;
    usersByRole: Record<(typeof USER_ROLES)[number], number>;
    rankDistribution: Record<(typeof USER_RANKS)[number], number>;
  };
  questMetrics: {
    totalQuests: number;
    availableQuests: number;
    completedQuests: number;
    questCompletionRate: number;
    avgTimeToComplete: number;
    questsByTrack: Record<(typeof QUEST_TRACKS)[number], number>;
    questsByDifficulty: Record<(typeof USER_RANKS)[number], number>;
  };
  activityMetrics: {
    dailyActiveUsers: CountPoint[];
    dailyQuestCompletions: CountPoint[];
    dailySignups: CountPoint[];
  };
  funnelMetrics: {
    available: number;
    inProgress: number;
    submitted: number;
    completed: number;
  };
  generatedAt: string;
}

const RANK_COLORS: Record<(typeof USER_RANKS)[number], string> = {
  F: '#94a3b8',
  E: '#8b5cf6',
  D: '#64748b',
  C: '#22c55e',
  B: '#3b82f6',
  A: '#f97316',
  S: '#f59e0b',
};

const TRACK_COLORS: Record<(typeof QUEST_TRACKS)[number], string> = {
  OPEN: '#38bdf8',
  INTERN: '#34d399',
  BOOTCAMP: '#fb923c',
};

function roleLabel(role: (typeof USER_ROLES)[number]) {
  switch (role) {
    case 'adventurer':
      return 'Adventurers';
    case 'company':
      return 'Companies';
    case 'admin':
      return 'Admins';
  }
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/analytics');
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to load admin analytics');
          return;
        }

        setAnalytics(data);
      } catch (fetchError) {
        console.error('Error fetching admin analytics:', fetchError);
        setError('An error occurred while loading admin analytics');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      void fetchAnalytics();
    }
  }, [router, session, status]);

  const activityTrendData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const signupsByDate = new Map(
      analytics.activityMetrics.dailySignups.map((point) => [point.date, point.count])
    );
    const completionsByDate = new Map(
      analytics.activityMetrics.dailyQuestCompletions.map((point) => [point.date, point.count])
    );

    return analytics.activityMetrics.dailyActiveUsers.map((point) => ({
      date: point.date,
      activeUsers: point.count,
      signups: signupsByDate.get(point.date) ?? 0,
      questCompletions: completionsByDate.get(point.date) ?? 0,
    }));
  }, [analytics]);

  const rankDistributionData = useMemo(
    () =>
      analytics
        ? USER_RANKS.map((rank) => ({
            rank,
            count: analytics.userMetrics.rankDistribution[rank],
          }))
        : [],
    [analytics]
  );

  const usersByRoleData = useMemo(
    () =>
      analytics
        ? USER_ROLES.map((role) => ({
            role: roleLabel(role),
            count: analytics.userMetrics.usersByRole[role],
          }))
        : [],
    [analytics]
  );

  const questsByTrackData = useMemo(
    () =>
      analytics
        ? QUEST_TRACKS.map((track) => ({
            track,
            count: analytics.questMetrics.questsByTrack[track],
          }))
        : [],
    [analytics]
  );

  const questsByDifficultyData = useMemo(
    () =>
      analytics
        ? USER_RANKS.map((rank) => ({
            rank,
            count: analytics.questMetrics.questsByDifficulty[rank],
          }))
        : [],
    [analytics]
  );

  const funnelData = useMemo(
    () =>
      analytics
        ? [
            { label: 'Available', count: analytics.funnelMetrics.available, color: 'bg-emerald-500' },
            { label: 'In Progress', count: analytics.funnelMetrics.inProgress, color: 'bg-sky-500' },
            { label: 'Submitted', count: analytics.funnelMetrics.submitted, color: 'bg-amber-500' },
            { label: 'Completed', count: analytics.funnelMetrics.completed, color: 'bg-violet-500' },
          ]
        : [],
    [analytics]
  );

  const maxFunnelCount = Math.max(...funnelData.map((item) => item.count), 1);

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </GuildPanel>
      </GuildPage>
    );
  }

  if (error || !analytics) {
    return (
      <GuildPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load analytics'}</AlertDescription>
        </Alert>
      </GuildPage>
    );
  }

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full border border-sky-300 bg-sky-100 text-sky-700">
              Admin Metrics
            </Badge>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Platform Analytics</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Monitor adoption, quest throughput, and retention signals from one admin command center.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Generated {format(new Date(analytics.generatedAt), 'MMM d, yyyy h:mm a')}</span>
              <span>-</span>
              <span>Last 30 days of activity</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin">
                Back to Admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/quests">
                Review Quests
                <Target className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Users</p>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.userMetrics.totalUsers}</p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.userMetrics.newUsersLast7d} new in the last 7 days
          </p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Users (7d)</p>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.userMetrics.activeUsersLast7d}</p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.userMetrics.activeUsersLast30d} active across 30 days
          </p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Quests</p>
            <Shield className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.questMetrics.totalQuests}</p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.questMetrics.availableQuests} currently available
          </p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion Rate</p>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {(analytics.questMetrics.questCompletionRate * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {analytics.questMetrics.completedQuests} completed quests
          </p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Time to Complete</p>
            <Clock3 className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.questMetrics.avgTimeToComplete}d</p>
          <p className="mt-1 text-xs text-slate-500">Measured from assignment to completion</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quest Mix</p>
            <Sparkles className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {analytics.questMetrics.questsByTrack.OPEN + analytics.questMetrics.questsByTrack.INTERN}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Open + Intern quests live in the pipeline
          </p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bootcamp Quests</p>
            <BarChart3 className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.questMetrics.questsByTrack.BOOTCAMP}</p>
          <p className="mt-1 text-xs text-slate-500">Dedicated learning-track briefs</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admins on Deck</p>
            <Shield className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.userMetrics.usersByRole.admin}</p>
          <p className="mt-1 text-xs text-slate-500">Admin accounts available to operate the platform</p>
        </GuildKpi>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">30-Day Activity Trends</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Daily active users, signups, and quest completions in one view.
                </p>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTrendData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" name="Active users" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="questCompletions" name="Quest completions" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="signups" name="Signups" stroke="#f97316" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GuildPanel>
        </GuildCard>

        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quest Funnel</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A quick read on how quests move from backlog to completed work.
                </p>
              </div>
              <div className="space-y-4">
                {funnelData.map((stage) => (
                  <div key={stage.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{stage.label}</p>
                      <span className="text-sm font-bold text-slate-900">{stage.count}</span>
                    </div>
                    <Progress value={(stage.count / maxFunnelCount) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </GuildPanel>
        </GuildCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Rank Distribution</h2>
                <p className="mt-1 text-sm text-slate-500">
                  How the player base is spread across rank tiers.
                </p>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankDistributionData} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis type="category" dataKey="rank" tick={{ fill: '#64748b', fontSize: 12 }} width={32} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                      {rankDistributionData.map((entry) => (
                        <Cell key={entry.rank} fill={RANK_COLORS[entry.rank]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GuildPanel>
        </GuildCard>

        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Users by Role</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Balance between adventurers, companies, and admins.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {usersByRoleData.map((role) => (
                  <div key={role.role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{role.role}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{role.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </GuildPanel>
        </GuildCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quests by Track</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Distribution across Open, Intern, and Bootcamp workstreams.
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questsByTrackData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="track" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {questsByTrackData.map((entry) => (
                        <Cell key={entry.track} fill={TRACK_COLORS[entry.track]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GuildPanel>
        </GuildCard>

        <GuildCard className="border-slate-200/80">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-5 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quests by Difficulty</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Difficulty spread across the quest catalog.
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questsByDifficultyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="rank" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f172a" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GuildPanel>
        </GuildCard>
      </div>
    </GuildPage>
  );
}
