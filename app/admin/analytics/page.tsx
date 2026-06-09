/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Users,
  Target,
  ArrowUpRight,
  Activity,
  BarChart2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RankBadge } from '@/components/ui/rank-badge';

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= value) {
          clearInterval(timer);
          return value;
        }
        return Math.floor(next);
      });
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'overview'
  );

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin') {
      return;
    }
    fetchAnalytics();
  }, [dateRange, session?.user?.role, status]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json.analytics || json);
    } catch (e) {
      setError('Failed to load analytics data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [router, session?.user?.role, status]);

  const StatCard = ({
    title,
    value,
    icon,
    color,
    loading: isLoading,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    loading: boolean;
  }) => (
    <Card className="border-slate-800/60 bg-slate-900/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`${color} w-8 h-8 rounded-lg flex items-center justify-center`}
          >
            {icon}
          </span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter value={value} />
          </div>
        )}
        <p className="text-sm text-slate-500 mt-1">{title}</p>
      </CardContent>
    </Card>
  );

  const BarChart = ({
    data,
    labelKey,
    valueKey,
    color,
  }: {
    data: any[];
    labelKey: string;
    valueKey: string;
    color: string;
  }) => {
    if (!data || data.length === 0) return <p className="text-sm text-slate-500 text-center py-8">No data available</p>;
    const max = Math.max(...data.map((d: any) => d[valueKey] || 0), 1);
    return (
      <div className="space-y-2">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-slate-400 w-24 text-right shrink-0">
              {item[labelKey]}
            </span>
            <div className="flex-1 h-6 rounded-full bg-slate-800/60 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-500 w-12 text-right font-medium">
              {item[valueKey]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const ActivityTimeline = ({ activities }: { activities: any[] }) => {
    if (!activities || activities.length === 0)
      return <p className="text-sm text-slate-500 text-center py-4">No activity data</p>;

    return (
      <div className="space-y-3">
        {activities.slice(0, 15).map((activity: any, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/30"
          >
            <Activity className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-slate-300 capitalize">
                {activity.action?.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500">
                {activity.action} × {activity._count?.id || activity.count || 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Section = ({
    id,
    title,
    icon,
    children,
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
        onClick={() => toggleSection(id)}
      >
        <div className="flex items-center gap-3">
          <span className="text-orange-400">{icon}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {expandedSection === id ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {expandedSection === id && <CardContent className="p-5 pt-0">{children}</CardContent>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="container px-6 mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-orange-400" />
              Platform Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time dashboard for monitoring platform health
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-sm w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
            <Button variant="ghost" onClick={fetchAnalytics} className="ml-auto">
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        )}

        {/* Data Loaded */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="DAU (Daily Active)"
                value={data.overview?.dau ?? 0}
                icon={<Users className="w-4 h-4" />}
                color="bg-blue-500/10 text-blue-400"
                loading={false}
              />
              <StatCard
                title="MAU (Monthly Active)"
                value={data.overview?.mau ?? 0}
                icon={<TrendingUp className="w-4 h-4" />}
                color="bg-violet-500/10 text-violet-400"
                loading={false}
              />
              <StatCard
                title="Completed Quests"
                value={data.quests?.completedQuests ?? 0}
                icon={<CheckCircle2 className="w-4 h-4" />}
                color="bg-emerald-500/10 text-emerald-400"
                loading={false}
              />
              <StatCard
                title="Total Users"
                value={data.overview?.totalUsers ?? 0}
                icon={<Users className="w-4 h-4" />}
                color="bg-orange-500/10 text-orange-400"
                loading={false}
              />
            </div>

            {/* Expandable Sections */}
            <div className="space-y-4">
              {/* Quest Pipeline */}
              <Section
                id="quests"
                title="Quest Pipeline"
                icon={<Target className="w-4 h-4" />}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: 'Active / Open',
                      value: data.quests?.activeQuests ?? 0,
                      color: 'bg-emerald-500/10 text-emerald-400',
                    },
                    {
                      label: 'Pending Review',
                      value: data.quests?.pendingQuests ?? 0,
                      color: 'bg-amber-500/10 text-amber-400',
                    },
                    {
                      label: 'Rejected',
                      value: data.quests?.rejectedQuests ?? 0,
                      color: 'bg-red-500/10 text-red-400',
                    },
                    {
                      label: 'Completion Rate',
                      value: data.completionMetrics?.completionRate ?? '—',
                      suffix: '%',
                      color: 'text-slate-300',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4 text-center"
                    >
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p
                        className={`text-2xl font-bold ${item.color}`}
                      >
                        {item.value}
                        {item.suffix}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quests by Category */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Quests by Category
                  </p>
                  <BarChart
                    data={data.quests?.byCategory ?? []}
                    labelKey="category"
                    valueKey="count"
                    color="fill-orange-500"
                  />
                </div>

                {/* Quests by Track */}
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                      Quests created by Track
                    </p>
                    <BarChart
                      data={data.quests?.byTrack ?? []}
                    labelKey="track"
                    valueKey="count"
                    color="fill-sky-500"
                  />
                </div>
              </Section>

              {/* Rank Distribution */}
              <Section
                id="ranks"
                title="Rank Distribution"
                icon={<Award className="w-4 h-4" />}
              >
                <BarChart
                  data={data.rankings?.rankDistribution ?? []}
                  labelKey="rank"
                  valueKey="count"
                  color="fill-violet-500"
                />
                {data.rankings?.topAdventurers && (
                  <div className="mt-6">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                      Top Adventurers by Completions
                    </p>
                    <div className="space-y-2">
                      {(data.rankings.topAdventurers as any[]).map(
                        (adv: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40"
                          >
                            <RankBadge
                              rank={adv.rank}
                              size="sm"
                              glow
                            />
                            <span className="text-sm text-white flex-1">
                              {adv.name}
                            </span>
                            <span className="text-sm text-slate-400">
                              {adv.completions} quests
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </Section>

              {/* Activity Feed */}
              <Section
                id="activity"
                title={`Activity Feed (${data.activity?.windowLabel ?? dateRange})`}
                icon={<Activity className="w-4 h-4" />}
              >
                <ActivityTimeline activities={data.activity?.last7Days ?? []} />
              </Section>

              {/* Completion Metrics */}
              <Section
                id="metrics"
                title="Completion Metrics"
                icon={<TrendingUp className="w-4 h-4" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Avg Completion Time
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.completionMetrics?.avgCompletionTimeDays ?? '—'}{' '}
                      days
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Quest Fill Rate
                    </p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      {data.completionMetrics?.completionRate ?? '—'}%
                    </p>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
