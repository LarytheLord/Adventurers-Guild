'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  Coins,
  Loader2,
  RefreshCw,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';

import {
  GuildCard,
  GuildChip,
  GuildHero,
  GuildKpi,
  GuildPage,
  GuildPanel,
} from '@/components/guild/primitives';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type TrackKey = 'OPEN' | 'INTERN' | 'BOOTCAMP';

interface RevenueRange {
  from: string;
  to: string;
}

interface RevenueResponse {
  success: boolean;
  from: string;
  to: string;
  generatedAt: string;
  displayCurrency: string;
  mrr: number;
  gmv: number;
  platformRevenue: number;
  takeRate: number;
  fillRate: number;
  questsPosted: number;
  questsCompleted: number;
  activeAdventurers: number;
  avgQuestValue: number;
  byTrack: Record<TrackKey, { gmv: number; count: number }>;
  timeline: Array<{
    date: string;
    gmv: number;
    questsCompleted: number;
  }>;
  topQuests: Array<{
    questId: string;
    title: string;
    track: TrackKey;
    reward: number;
    completionDate: string | null;
  }>;
  topAdventurers: Array<{
    userId: string;
    name: string;
    rank: string;
    totalEarned: number;
  }>;
}

function formatInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createDefaultRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 29);

  return {
    from: formatInputDate(from),
    to: formatInputDate(today),
  };
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

async function requestRevenue(range: RevenueRange) {
  const params = new URLSearchParams({
    from: range.from,
    to: range.to,
  });

  const response = await fetch(`/api/admin/revenue?${params.toString()}`, {
    cache: 'no-store',
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to load revenue metrics');
  }

  return payload as RevenueResponse;
}

export default function AdminRevenuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [range, setRange] = useState(createDefaultRange);
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRevenue(nextRange = range) {
    const firstLoad = data === null;
    setError(null);

    if (firstLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      setData(await requestRevenue(nextRange));
    } catch (err) {
      console.error('Failed to load revenue dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load revenue metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated') {
      const initialRange = createDefaultRange();
      setRange(initialRange);

      void (async () => {
        setError(null);
        setLoading(true);

        try {
          setData(await requestRevenue(initialRange));
        } catch (err) {
          console.error('Failed to load revenue dashboard:', err);
          setError(err instanceof Error ? err.message : 'Failed to load revenue metrics');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [router, session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="guild-panel max-w-md space-y-3 p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Revenue dashboard unavailable</h1>
          <p className="text-sm text-slate-600">{error}</p>
          <Button onClick={() => void fetchRevenue(range)}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const trackChart = (['OPEN', 'INTERN', 'BOOTCAMP'] as TrackKey[]).map((track) => ({
    track,
    count: data.byTrack[track].count,
    gmv: data.byTrack[track].gmv,
  }));

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <GuildChip>Finance Watchtower</GuildChip>
              <GuildChip>{data.from} to {data.to}</GuildChip>
              <GuildChip>MRR parked at {formatCurrency(data.mrr, data.displayCurrency)}</GuildChip>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Platform revenue at a glance.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Track gross quest volume, realized platform commission, delivery fill rate, and the adventurers
                driving earnings across the guild.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:flex-row sm:items-end">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>From</span>
                <Input
                  type="date"
                  value={range.from}
                  max={range.to}
                  onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))}
                  className="w-full bg-white"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-slate-700">
                <span>To</span>
                <Input
                  type="date"
                  value={range.to}
                  min={range.from}
                  onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))}
                  className="w-full bg-white"
                />
              </label>
            </div>
            <Button onClick={() => void fetchRevenue()} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
      </GuildHero>

      {error && (
        <GuildPanel className="border-amber-200 bg-amber-50/80">
          <div className="px-5 py-4 text-sm text-amber-900">
            {error}
          </div>
        </GuildPanel>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GMV</p>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.gmv, data.displayCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.questsCompleted} completed quest{data.questsCompleted === 1 ? '' : 's'}
          </p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Platform Revenue</p>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(data.platformRevenue, data.displayCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">15% commission fallback applied when fees are missing</p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Take Rate</p>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatPercent(data.takeRate)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Average quest value {formatCurrency(data.avgQuestValue, data.displayCurrency)}
          </p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fill Rate</p>
            <Activity className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatPercent(data.fillRate)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {data.questsCompleted} completed of {data.questsPosted} posted
          </p>
        </GuildKpi>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr,1fr]">
        <GuildCard>
          <CardHeader>
            <CardTitle>30-day GMV trend</CardTitle>
            <CardDescription>Gross quest value processed each day</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, data.displayCurrency)}
                  labelFormatter={(value) => `Date: ${value}`}
                />
                <Line
                  type="monotone"
                  dataKey="gmv"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </GuildCard>

        <GuildCard>
          <CardHeader>
            <CardTitle>Completed quests by track</CardTitle>
            <CardDescription>Volume split between open, intern, and bootcamp tracks</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="track" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'gmv'
                      ? formatCurrency(value, data.displayCurrency)
                      : value
                  }
                />
                <Legend />
                <Bar dataKey="count" name="Completed quests" fill="#0f766e" radius={[10, 10, 0, 0]} />
                <Bar dataKey="gmv" name="GMV" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </GuildCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GuildPanel>
          <CardHeader>
            <CardTitle>Top quests by value</CardTitle>
            <CardDescription>Highest-value completed quests in the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quest</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topQuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No completed quest payouts in this range yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topQuests.map((quest) => (
                    <TableRow key={quest.questId}>
                      <TableCell className="font-medium text-slate-900">{quest.title}</TableCell>
                      <TableCell>{quest.track}</TableCell>
                      <TableCell>{formatCurrency(quest.reward, data.displayCurrency)}</TableCell>
                      <TableCell>{quest.completionDate ?? 'Pending'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </GuildPanel>

        <GuildPanel>
          <CardHeader>
            <CardTitle>Top adventurers by earnings</CardTitle>
            <CardDescription>Who captured the largest payout share in this window</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adventurer</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Total earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topAdventurers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                      No earnings have been booked yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topAdventurers.map((adventurer) => (
                    <TableRow key={adventurer.userId}>
                      <TableCell className="font-medium text-slate-900">{adventurer.name}</TableCell>
                      <TableCell>{adventurer.rank}-Rank</TableCell>
                      <TableCell>{formatCurrency(adventurer.totalEarned, data.displayCurrency)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </GuildPanel>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Adventurers</p>
            <Trophy className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.activeAdventurers}</p>
          <p className="mt-1 text-xs text-slate-500">Distinct adventurers with assignments in range</p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quests Posted</p>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.questsPosted}</p>
          <p className="mt-1 text-xs text-slate-500">New quests opened during this period</p>
        </GuildKpi>

        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated</p>
            <RefreshCw className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {new Date(data.generatedAt).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">Last successful admin revenue snapshot</p>
        </GuildKpi>
      </section>
    </GuildPage>
  );
}
