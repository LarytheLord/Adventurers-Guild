'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, DollarSign, Loader2, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RANGES = [
  { label: '7d', value: '7d' as const },
  { label: '30d', value: '30d' as const },
  { label: '90d', value: '90d' as const },
];

const RANK_COLORS: Record<string, string> = {
  S: '#f59e0b',
  A: '#10b981',
  B: '#3b82f6',
  C: '#8b5cf6',
  D: '#ec4899',
  E: '#6b7280',
  F: '#9ca3af',
};

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalAdventurers: number;
    totalCompanies: number;
    totalQuests: number;
    completedQuests: number;
    totalRevenue: number;
    recentUsers: number;
    recentCompletions: number;
    pendingSubmissions: number;
  };
  rankDistribution: { rank: string; count: number }[];
  usersOverTime: { date: string; count: number }[];
  questsOverTime: { date: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchData = useCallback(async (selectedRange: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to fetch analytics');
        return;
      }
      setData(json.data);
    } catch {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-1 text-slate-400">Platform metrics and trends</p>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r.value)}
                className={range === r.value ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : data ? (
          <>
            <SummaryCards summary={data.summary} />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="User Growth"
                description="New users per day"
                icon={<Users className="h-4 w-4 text-indigo-400" />}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.usersOverTime}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#userGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Quest Completions"
                description="Completed quests per day"
                icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.questsOverTime}>
                    <defs>
                      <linearGradient id="questGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#questGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Rank Distribution"
                description="Adventurers by rank"
                icon={<Users className="h-4 w-4 text-purple-400" />}
                loading={loading}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.rankDistribution}
                      dataKey="count"
                      nameKey="rank"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={((entry: { rank: string; count: number }) => `${entry.rank}: ${entry.count}`) as any}
                    >
                      {data.rankDistribution.map((entry) => (
                        <Cell key={entry.rank} fill={RANK_COLORS[entry.rank] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Revenue Trend"
                description="Total platform revenue (USD)"
                icon={<DollarSign className="h-4 w-4 text-yellow-400" />}
                loading={loading}
              >
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-400">
                      ${(data.summary.totalRevenue ?? 0).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Across {data.summary.totalQuests} quests
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCards({ summary }: { summary: AnalyticsData['summary'] }) {
  const cards = [
    { label: 'Total Users', value: summary.totalUsers.toLocaleString(), accent: 'text-indigo-400' },
    { label: 'Adventurers', value: summary.totalAdventurers.toLocaleString(), accent: 'text-emerald-400' },
    { label: 'Companies', value: summary.totalCompanies.toLocaleString(), accent: 'text-blue-400' },
    { label: 'Quests', value: summary.totalQuests.toLocaleString(), accent: 'text-amber-400' },
    { label: 'Completed', value: summary.completedQuests.toLocaleString(), accent: 'text-green-400' },
    { label: 'Pending Review', value: summary.pendingSubmissions.toLocaleString(), accent: 'text-orange-400' },
    { label: 'New Users', value: summary.recentUsers.toLocaleString(), accent: 'text-violet-400', suffix: '(selected range)' },
    { label: 'Completions', value: summary.recentCompletions.toLocaleString(), accent: 'text-teal-400', suffix: '(selected range)' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs uppercase tracking-wider">
              {card.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.accent}`}>{card.value}</p>
            {card.suffix && <p className="mt-0.5 text-[11px] text-slate-500">{card.suffix}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  description,
  icon,
  loading,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
            <CardDescription className="text-xs text-slate-400">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
