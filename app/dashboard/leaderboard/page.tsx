'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiFetch } from '@/lib/hooks';

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

type RankingsResponse = {
  success: boolean;
  rankings: AdventurerRankRow[];
  total: number;
};

type UserRankResponse = {
  success: boolean;
  rank: { position: number; totalUsers: number } | null;
};

const EMPTY: AdventurerRankRow[] = [];

const RANK_COLORS: Record<string, string> = {
  S: 'border-amber-200 bg-amber-50 text-amber-700',
  A: 'border-violet-200 bg-violet-50 text-violet-700',
  B: 'border-blue-200 bg-blue-50 text-blue-700',
  C: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  D: 'border-slate-200 bg-slate-50 text-slate-600',
  E: 'border-stone-200 bg-stone-50 text-stone-500',
  F: 'border-gray-200 bg-gray-50 text-gray-400',
};

const rankToTier: Record<string, string> = {
  F: 'T1', E: 'T2', D: 'T3', C: 'T4', B: 'T5', A: 'T6', S: 'T7',
};

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sort, setSort] = useState<'xp' | 'level' | 'skillPoints'>('xp');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [router, status]);

  const shouldFetch = status === 'authenticated';

  const { data: rankingsData, loading: rankingsLoading } = useApiFetch<RankingsResponse>(
    `/api/rankings?mode=adventurer&sort=${sort}&order=desc&limit=50`,
    { skip: !shouldFetch }
  );
  const { data: userRankData, loading: userRankLoading } = useApiFetch<UserRankResponse>(
    `/api/rankings/user?mode=adventurer&sort=${sort}&order=desc`,
    { skip: !shouldFetch }
  );

  const adventurers = rankingsData?.rankings ?? EMPTY;
  const userPosition = userRankData?.rank ?? null;

  if (status === 'loading' || (shouldFetch && (rankingsLoading || userRankLoading))) {
    return (
      <div className="min-h-screen bg-background ds-page-grain flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  return (
    <div className="min-h-screen bg-background ds-page-grain">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leaderboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {userPosition
                ? `You're #${userPosition.position} of ${userPosition.totalUsers} adventurers`
                : 'Guild adventurer rankings'}
            </p>
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">By XP</SelectItem>
              <SelectItem value="level">By Level</SelectItem>
              <SelectItem value="skillPoints">By Skill Points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rankings list */}
        <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden">
          {adventurers.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">No ranking data yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {adventurers.map((user) => {
                const isCurrentUser = session?.user?.id === user.id;
                const profile = user.adventurer_profiles;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                      isCurrentUser ? 'bg-orange-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Position */}
                    <div className="w-8 shrink-0 text-center">
                      {MEDALS[user.position] ? (
                        <span className="text-base">{MEDALS[user.position]}</span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">{user.position}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-600">
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + meta */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] font-medium text-orange-500">you</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {profile?.specialization ?? 'Adventurer'}
                        {profile?.totalQuestsCompleted ? ` · ${profile.totalQuestsCompleted} quests` : ''}
                      </p>
                    </div>

                    {/* Tier badge + XP */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={`text-[10px] py-0 ${RANK_COLORS[user.rank] ?? ''}`}>
                        {rankToTier[user.rank] ?? user.rank}
                      </Badge>
                      <div className="text-right min-w-[60px] sm:min-w-[72px]">
                        <p className="text-sm font-bold text-slate-900">{user.xp.toLocaleString()} XP</p>
                        <p className="text-[11px] text-slate-400">{user.skillPoints} SP</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
