'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  Building2,
  Medal,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

type Mode = 'adventurer' | 'company';

type AdventurerRankRow = {
  id: string;
  name: string;
  rank: string;
  xp: number;
  level: number;
  skillPoints: number;
  position: number;
  adventurer_profiles?: {
    specialization?: string;
    totalQuestsCompleted?: number;
  };
};

type CompanyRankRow = {
  id: string;
  name: string;
  companyName: string;
  totalSpent: number;
  questsPosted: number;
  completedQuests: number;
  activeQuests: number;
  position: number;
  isVerified: boolean;
};

const RANK_COLORS: Record<string, string> = {
  S: 'bg-amber-100 text-amber-700 border-amber-300',
  A: 'bg-violet-100 text-violet-700 border-violet-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  D: 'bg-slate-100 text-slate-700 border-slate-300',
  E: 'bg-stone-100 text-stone-600 border-stone-300',
  F: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const defaultMode: Mode = session?.user?.role === 'company' ? 'company' : 'adventurer';

  const [mode, setMode] = useState<Mode>(defaultMode);
  const [adventurerSort, setAdventurerSort] = useState<'xp' | 'level' | 'skillPoints'>('xp');
  const [companySort, setCompanySort] = useState<'totalSpent' | 'questsPosted' | 'completedQuests' | 'activeQuests'>('totalSpent');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<{ position: number; totalUsers: number } | null>(null);
  const [adventurers, setAdventurers] = useState<AdventurerRankRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRankRow[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      setMode(session?.user?.role === 'company' ? 'company' : 'adventurer');
    }
  }, [status, session?.user?.role]);

  const activeSort = mode === 'adventurer' ? adventurerSort : companySort;

  useEffect(() => {
    const loadRankings = async () => {
      if (status !== 'authenticated') return;

      try {
        setLoading(true);

        const [rankingRes, userRankRes] = await Promise.all([
          fetch(`/api/rankings?mode=${mode}&sort=${activeSort}&order=desc&limit=50`),
          fetch(`/api/rankings/user?mode=${mode}&sort=${activeSort}&order=desc`),
        ]);

        const rankingData = await rankingRes.json();
        const userRankData = await userRankRes.json();

        if (mode === 'adventurer') {
          setAdventurers(rankingData.rankings || []);
        } else {
          setCompanies(rankingData.rankings || []);
        }

        setUserPosition(userRankData.rank || null);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        if (mode === 'adventurer') setAdventurers([]);
        else setCompanies([]);
        setUserPosition(null);
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, [mode, activeSort, status]);

  const topThree = useMemo(() => {
    if (mode === 'adventurer') {
      if (adventurers.length < 3) return [];
      return [adventurers[1], adventurers[0], adventurers[2]].filter(Boolean);
    }

    if (companies.length < 3) return [];
    return [companies[1], companies[0], companies[2]].filter(Boolean);
  }, [mode, adventurers, companies]);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-semibold text-slate-500">{position}</span>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="guild-page">
        <div className="guild-panel flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const activeRows = mode === 'adventurer' ? adventurers : companies;

  return (
    <div className="guild-page">
      <section className="guild-hero">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full border border-violet-300 bg-violet-100 text-violet-700">
              Guild Rankings
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              {mode === 'adventurer' ? 'Adventurer Leaderboard' : 'Company Impact Leaderboard'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {mode === 'adventurer'
                ? 'See who is climbing from F-Rank to S-Rank the fastest.'
                : 'Track which companies are creating the strongest quest ecosystems.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adventurer">Adventurer Board</SelectItem>
                <SelectItem value="company">Company Board</SelectItem>
              </SelectContent>
            </Select>

            {mode === 'adventurer' ? (
              <Select value={adventurerSort} onValueChange={(value) => setAdventurerSort(value as typeof adventurerSort)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp">Sort by XP</SelectItem>
                  <SelectItem value="level">Sort by Level</SelectItem>
                  <SelectItem value="skillPoints">Sort by Skill Points</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={companySort} onValueChange={(value) => setCompanySort(value as typeof companySort)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalSpent">Sort by Total Spend</SelectItem>
                  <SelectItem value="completedQuests">Sort by Completed Quests</SelectItem>
                  <SelectItem value="questsPosted">Sort by Quests Posted</SelectItem>
                  <SelectItem value="activeQuests">Sort by Active Quests</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="guild-kpi sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your Position</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            #{userPosition?.position ?? '-'}
            <span className="ml-1 text-sm font-medium text-slate-500">/ {userPosition?.totalUsers ?? '-'}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Current standing on selected board</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Board Type</p>
            {mode === 'adventurer' ? <Users className="h-4 w-4 text-sky-500" /> : <Building2 className="h-4 w-4 text-violet-500" />}
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 capitalize">{mode}</p>
          <p className="mt-1 text-xs text-slate-500">{activeRows.length} visible entries</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Sort</p>
            <ArrowUpRight className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeSort}</p>
          <p className="mt-1 text-xs text-slate-500">Descending order</p>
        </article>

        <article className="guild-kpi">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Season Highlight</p>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">Top 3</p>
          <p className="mt-1 text-xs text-slate-500">Podium updates in real time</p>
        </article>
      </section>

      {topThree.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {topThree.map((row, idx) => {
            const isCenter = idx === 1;
            const name = mode === 'adventurer' ? (row as AdventurerRankRow).name : (row as CompanyRankRow).companyName;
            const position = row.position;

            return (
              <Card
                key={`${mode}-${row.id}`}
                className={`guild-panel text-center ${isCenter ? 'border-amber-300 bg-amber-50/70 -mt-1 md:-mt-3' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="mb-2 flex justify-center">{getPositionIcon(position)}</div>
                  <Avatar className={`mx-auto ${isCenter ? 'h-14 w-14' : 'h-12 w-12'}`}>
                    <AvatarFallback className="text-lg font-bold">{name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-900">{name}</p>

                  {mode === 'adventurer' ? (
                    <>
                      <Badge variant="outline" className={`mt-2 ${RANK_COLORS[(row as AdventurerRankRow).rank] || ''}`}>
                        {(row as AdventurerRankRow).rank}-Rank
                      </Badge>
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        {(row as AdventurerRankRow).xp.toLocaleString()} XP
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="mt-2 bg-sky-100 text-sky-700 border-sky-300">
                        {(row as CompanyRankRow).isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        ${(row as CompanyRankRow).totalSpent.toLocaleString()} invested
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card className="guild-panel">
        <CardHeader>
          <CardTitle>{mode === 'adventurer' ? 'Full Adventurer Rankings' : 'Full Company Rankings'}</CardTitle>
          <CardDescription>
            {mode === 'adventurer'
              ? 'Leaderboard by adventurer performance and progression'
              : 'Leaderboard by company spend and quest operations'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activeRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No ranking data available yet.</div>
          ) : (
            <div className="divide-y">
              {mode === 'adventurer'
                ? adventurers.map((user) => {
                    const isCurrentUser = session?.user?.id === user.id;
                    const profile = user.adventurer_profiles;

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 px-5 py-3.5 ${isCurrentUser ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-8 shrink-0 text-center">{getPositionIcon(user.position)}</div>
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                            {isCurrentUser && <span className="ml-2 text-xs font-medium text-slate-500">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-500">
                            {profile?.specialization || 'Adventurer'} · Level {user.level}
                            {profile?.totalQuestsCompleted ? ` · ${profile.totalQuestsCompleted} quests` : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className={RANK_COLORS[user.rank] || ''}>
                          {user.rank}
                        </Badge>
                        <div className="w-24 shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-900">{user.xp.toLocaleString()} XP</p>
                          <p className="text-xs text-slate-500">{user.skillPoints} SP</p>
                        </div>
                      </div>
                    );
                  })
                : companies.map((company) => {
                    const isCurrentUser = session?.user?.id === company.id;
                    return (
                      <div
                        key={company.id}
                        className={`flex items-center gap-4 px-5 py-3.5 ${isCurrentUser ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-8 shrink-0 text-center">{getPositionIcon(company.position)}</div>
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback>{company.companyName?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {company.companyName}
                            {isCurrentUser && <span className="ml-2 text-xs font-medium text-slate-500">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-500">
                            {company.completedQuests} completed · {company.activeQuests} active · {company.questsPosted} posted
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={company.isVerified ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}
                        >
                          {company.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                        <div className="w-28 shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-900">${company.totalSpent.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">total spend</p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link href={mode === 'adventurer' ? '/dashboard/quests' : '/dashboard/company/create-quest'}>
            {mode === 'adventurer' ? 'Find Next Quest' : 'Launch New Quest'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
