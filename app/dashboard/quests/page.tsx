'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useApiFetch } from '@/lib/hooks';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { DIFFICULTY_RANKS, QUEST_CATEGORIES } from '@/lib/quest-constants';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

interface QuestPartyMemberUser {
  id: string;
  name: string | null;
  rank: string | null;
  avatar?: string | null;
}

interface QuestPartyMember {
  id: string;
  userId: string;
  isLeader: boolean;
  user: QuestPartyMemberUser;
}

interface QuestParty {
  id: string;
  leaderId: string;
  track: string;
  maxSize: number;
  members: QuestPartyMember[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  questType: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  track: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  shareCount?: number;
  party?: QuestParty | null;
  company?: { name: string; email: string };
}

type SortOption = 'newest' | 'xp_desc' | 'pay_desc' | 'deadline_asc';
type PartyFilter = 'all' | 'solo' | 'squad';

const TRACK_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'BOOTCAMP', label: 'Bootcamp' },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'xp_desc', label: 'Highest XP' },
  { value: 'pay_desc', label: 'Highest Pay' },
  { value: 'deadline_asc', label: 'Deadline Soon' },
];

const EMPTY_QUESTS: Quest[] = [];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [track, setTrack] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [partyFilter, setPartyFilter] = useState<PartyFilter>('all');
  const [joiningPartyId, setJoiningPartyId] = useState<string | null>(null);
  const [isBootcamp, setIsBootcamp] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isAdmin = session?.user?.role === 'admin';
  const shouldFetch = status === 'authenticated' && session?.user?.role !== 'company';

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({ status: 'available', limit: '60' });
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    if (track !== 'all') params.set('track', track);
    if (category !== 'all') params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    return `/api/quests?${params.toString()}`;
  }, [debouncedSearchTerm, difficulty, track, category, sort]);

  const { data, loading, error, refetch } = useApiFetch<Quest[]>(apiUrl, { skip: !shouldFetch });
  const quests = (Array.isArray(data) ? data : []) ?? EMPTY_QUESTS;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role === 'company') { router.push('/dashboard/company'); return; }
  }, [status, session?.user?.role, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'adventurer') {
      const fetchBootcampStatus = async () => {
        try {
          const response = await fetchWithAuth('/api/users/me/bootcamp');
          const data = await response.json();
          if (data.success && data.isBootcamp) { setIsBootcamp(true); setTrack('BOOTCAMP'); }
        } catch (error) { console.error('Error fetching bootcamp status:', error); }
      };
      void fetchBootcampStatus();
    }
  }, [status, session?.user?.role]);

  const filteredQuests = quests.filter((quest) => {
    const isSquadQuest = (quest.maxParticipants ?? 1) > 1;
    if (partyFilter === 'solo') return !isSquadQuest;
    if (partyFilter === 'squad') return isSquadQuest;
    return true;
  });

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(searchTerm ? [{ key: 'search', label: `"${searchTerm}"`, clear: () => setSearchTerm('') }] : []),
    ...(difficulty !== 'all' ? [{ key: 'difficulty', label: `${difficulty}-Rank`, clear: () => setDifficulty('all') }] : []),
    ...(track !== 'all' ? [{ key: 'track', label: TRACK_OPTIONS.find((t) => t.value === track)?.label ?? track, clear: () => setTrack('all') }] : []),
    ...(category !== 'all' ? [{ key: 'category', label: QUEST_CATEGORIES.find((c) => c.value === category)?.label ?? category, clear: () => setCategory('all') }] : []),
    ...(sort !== 'newest' ? [{ key: 'sort', label: SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort, clear: () => setSort('newest') }] : []),
    ...(partyFilter !== 'all' ? [{ key: 'party', label: partyFilter === 'solo' ? 'Solo' : 'Squad', clear: () => setPartyFilter('all') }] : []),
  ];

  function getInitials(name: string | null | undefined) {
    if (!name) return '?';
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
  }

  function getQuestPartySize(quest: Quest) { return quest.party?.members.length ?? 0; }
  function getQuestPartyCapacity(quest: Quest) { return quest.party?.maxSize ?? quest.maxParticipants ?? 1; }
  function isCurrentUserPartyMember(quest: Quest) {
    const userId = session?.user?.id;
    if (!userId || !quest.party) return false;
    return quest.party.members.some((m) => m.user.id === userId);
  }

  async function joinParty(quest: Quest) {
    if (!session?.user?.id || !quest.party) return;
    try {
      setJoiningPartyId(quest.id);
      const response = await fetchWithAuth(`/api/parties/${quest.party.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await response.json();
      if (!data.success) { toast.error(data.error || 'Failed to join party'); return; }
      toast.success('Joined party successfully');
      await refetch();
    } catch { toast.error('An error occurred while joining the party'); }
    finally { setJoiningPartyId(null); }
  }

  function clearAllFilters() {
    setSearchTerm(''); setDifficulty('all'); setTrack('all');
    setCategory('all'); setSort('newest'); setPartyFilter('all');
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background ds-page-grain flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background ds-page-grain p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const highRewardCount = filteredQuests.filter((q) => q.xpReward >= 1500).length;
  const newThisWeek = filteredQuests.filter(
    (q) => Date.now() - new Date(q.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 7
  ).length;

  return (
    <div className="min-h-screen bg-background ds-page-grain">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">

        {/* ── Compact header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quest Board</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {filteredQuests.length} open · {highRewardCount} high XP · {newThisWeek} new this week
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>

        {/* ── Filter bar ── */}
        <div className="rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-3 space-y-2.5">
          {/* Row 1: search + selects */}
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search quests, skills, company…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm flex-1 min-w-[180px]"
            />

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {DIFFICULTY_RANKS.map((r) => (
                  <SelectItem key={r} value={r}>{r}-Rank</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue placeholder="Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                {TRACK_OPTIONS.filter((t) => isAdmin || t.value !== 'INTERN').map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {QUEST_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: party toggle + active chips */}
          <div className="flex flex-wrap items-center gap-2">
            {!isBootcamp && (
              <div className="flex items-center rounded-lg border border-border/70 bg-slate-50 p-0.5 gap-0.5">
                {(['all', 'solo', 'squad'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setPartyFilter(v)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors capitalize ${
                      partyFilter === v
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {v === 'all' ? 'All' : v === 'solo' ? 'Solo' : 'Squad'}
                  </button>
                ))}
              </div>
            )}

            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
              >
                {f.label}
                <button onClick={f.clear} className="rounded-full hover:bg-orange-100 p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Quest grid ── */}
        {filteredQuests.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 py-16 text-center">
            <p className="text-sm font-medium text-slate-500">No quests found.</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                userId={session?.user?.id}
                joiningPartyId={joiningPartyId}
                onJoinParty={joinParty}
                getInitials={getInitials}
                getQuestPartySize={getQuestPartySize}
                getQuestPartyCapacity={getQuestPartyCapacity}
                isCurrentUserPartyMember={isCurrentUserPartyMember}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// ── Quest Card ────────────────────────────────────────────────────────────────
// Uses flex-col with flex-1 spacer so all cards in a row stretch to equal height
function QuestCard({
  quest,
  userId,
  joiningPartyId,
  onJoinParty,
  getInitials,
  getQuestPartySize,
  getQuestPartyCapacity,
  isCurrentUserPartyMember,
}: {
  quest: Quest;
  userId?: string;
  joiningPartyId: string | null;
  onJoinParty: (q: Quest) => void;
  getInitials: (n: string | null | undefined) => string;
  getQuestPartySize: (q: Quest) => number;
  getQuestPartyCapacity: (q: Quest) => number;
  isCurrentUserPartyMember: (q: Quest) => boolean;
}) {
  const isSquad = (quest.maxParticipants ?? 1) > 1;
  const partySize = getQuestPartySize(quest);
  const partyCapacity = getQuestPartyCapacity(quest);
  const isMember = isCurrentUserPartyMember(quest);

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-orange-100">
      {/* Top section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">{quest.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{quest.company?.name ?? 'Unknown Company'}</p>
          </div>
          <RankBadge rank={quest.difficulty as Rank} size="sm" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="secondary" className="text-[10px] capitalize py-0">
            {quest.questCategory.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0">
            {isSquad ? `Squad ${partySize}/${partyCapacity}` : 'Solo'}
          </Badge>
          {quest.track && quest.track !== 'OPEN' && (
            <Badge className="text-[10px] py-0 bg-orange-50 text-orange-700 border border-orange-200">
              {quest.track.toLowerCase()}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{quest.description}</p>

        {/* Squad members (only if squad) */}
        {isSquad && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {partySize > 0 && quest.party ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {quest.party.members.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? ''} />
                      <AvatarFallback className="bg-slate-100 text-[9px] font-semibold text-slate-700">
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-xs text-slate-500">{partySize} member{partySize !== 1 ? 's' : ''}</p>
                {quest.party && partySize < partyCapacity && !isMember && (
                  <button
                    onClick={() => onJoinParty(quest)}
                    disabled={joiningPartyId === quest.id}
                    className="ml-auto text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                  >
                    {joiningPartyId === quest.id ? 'Joining…' : 'Join'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No party formed yet · open slots</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        {/* Rewards */}
        <div className="flex items-center gap-3 text-xs mb-3">
          <span className="font-semibold text-amber-600">{quest.xpReward} XP</span>
          <span className="text-slate-400">{quest.skillPointsReward} SP</span>
          {quest.monetaryReward && Number(quest.monetaryReward) > 0 && (
            <span className="font-semibold text-emerald-600 ml-auto">
              ₹{Number(quest.monetaryReward).toLocaleString('en-IN')}
            </span>
          )}
          {quest.deadline && (
            <span className="text-slate-400 ml-auto">
              Due {new Date(quest.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Skills */}
        {quest.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {quest.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={`${quest.id}-${skill}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
              >
                {skill}
              </span>
            ))}
            {quest.requiredSkills.length > 3 && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400">
                +{quest.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/dashboard/quests/${quest.id}`}
          className="block w-full rounded-xl bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          View Quest Details
        </Link>
      </div>
    </div>
  );
}
