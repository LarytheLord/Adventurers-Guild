'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Search,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { GuildCard, GuildHero, GuildKpi, GuildPage, GuildPanel } from '@/components/guild/primitives';
import { useApiFetch } from '@/lib/hooks';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { DIFFICULTY_RANKS, QUEST_CATEGORIES } from '@/lib/quest-constants';

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
  party?: QuestParty | null;
  company?: {
    name: string;
    email: string;
  };
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

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [track, setTrack] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [partyFilter, setPartyFilter] = useState<PartyFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [joiningPartyId, setJoiningPartyId] = useState<string | null>(null);
  const [isBootcamp, setIsBootcamp] = useState(false);

  const isAdmin = session?.user?.role === 'admin';
  const shouldFetch = status === 'authenticated' && session?.user?.role !== 'company';

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({ status: 'available', limit: '60' });
    if (searchTerm) params.set('search', searchTerm);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    if (track !== 'all') params.set('track', track);
    if (category !== 'all') params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    return `/api/quests?${params.toString()}`;
  }, [searchTerm, difficulty, track, category, sort]);

  const { data, loading, error, refetch } = useApiFetch<{ success: boolean; quests: Quest[]; error?: string }>(apiUrl, {
    skip: !shouldFetch,
  });
  const quests = data?.quests ?? EMPTY_QUESTS;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company');
      return;
    }
  }, [status, session, router]);

  // Fetch bootcamp status
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'adventurer') {
      const fetchBootcampStatus = async () => {
        try {
          const response = await fetchWithAuth('/api/users/me/bootcamp');
          const data = await response.json();
          if (data.success && data.isBootcamp) {
            setIsBootcamp(true);
            // Auto-set track to BOOTCAMP for bootcamp users
            setTrack('BOOTCAMP');
          }
        } catch (error) {
          console.error('Error fetching bootcamp status:', error);
        }
      };
      void fetchBootcampStatus();
    }
  }, [status, session]);

  const filteredQuests = quests.filter((quest) => {
    const isSquadQuest = (quest.maxParticipants ?? 1) > 1;

    if (partyFilter === 'solo') {
      return !isSquadQuest;
    }

    if (partyFilter === 'squad') {
      return isSquadQuest;
    }

    return true;
  });

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(searchTerm ? [{ key: 'search', label: `"${searchTerm}"`, clear: () => setSearchTerm('') }] : []),
    ...(difficulty !== 'all' ? [{ key: 'difficulty', label: `${difficulty}-Rank`, clear: () => setDifficulty('all') }] : []),
    ...(track !== 'all'
      ? [{ key: 'track', label: TRACK_OPTIONS.find((t) => t.value === track)?.label ?? track, clear: () => setTrack('all') }]
      : []),
    ...(category !== 'all'
      ? [{ key: 'category', label: QUEST_CATEGORIES.find((c) => c.value === category)?.label ?? category, clear: () => setCategory('all') }]
      : []),
    ...(sort !== 'newest'
      ? [{ key: 'sort', label: SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort, clear: () => setSort('newest') }]
      : []),
    ...(partyFilter !== 'all'
      ? [
          {
            key: 'party',
            label: partyFilter === 'solo' ? 'Solo quests' : 'Squad quests',
            clear: () => setPartyFilter('all'),
          },
        ]
      : []),
  ];

  function getInitials(name: string | null | undefined) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  }

  function getQuestPartySize(quest: Quest) {
    return quest.party?.members.length ?? 0;
  }

  function getQuestPartyCapacity(quest: Quest) {
    return quest.party?.maxSize ?? quest.maxParticipants ?? 1;
  }

  function isCurrentUserPartyMember(quest: Quest) {
    const userId = session?.user?.id;
    if (!userId || !quest.party) return false;
    return quest.party.members.some((member) => member.user.id === userId);
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
      if (!data.success) {
        toast.error(data.error || 'Failed to join party');
        return;
      }

      toast.success('Joined party successfully');
      await refetch();
    } catch (joinError) {
      console.error('Error joining party:', joinError);
      toast.error('An error occurred while joining the party');
    } finally {
      setJoiningPartyId(null);
    }
  }

  function clearAllFilters() {
    setSearchTerm('');
    setDifficulty('all');
    setTrack('all');
    setCategory('all');
    setSort('newest');
    setPartyFilter('all');
  }

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-64 sm:min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </GuildPanel>
      </GuildPage>
    );
  }

  if (error) {
    return (
      <GuildPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </GuildPage>
    );
  }

  const highRewardCount = filteredQuests.filter((quest) => quest.xpReward >= 1500).length;

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700">
              Quest Marketplace
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Available Quests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Browse live company projects, match your rank, and choose your next challenge.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GuildKpi className="sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Quests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{filteredQuests.length}</p>
          <p className="mt-1 text-xs text-slate-500">Matching your current search</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">High XP Quests</p>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{highRewardCount}</p>
          <p className="mt-1 text-xs text-slate-500">1500 XP and above</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Newly Posted</p>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {filteredQuests.filter((quest) => Date.now() - new Date(quest.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 7).length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Posted in last 7 days</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quest Types</p>
            <Trophy className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {new Set(filteredQuests.map((quest) => quest.questType)).size}
          </p>
          <p className="mt-1 text-xs text-slate-500">Distinct categories</p>
        </GuildKpi>
      </section>

      {/* Filter Bar */}
      <GuildPanel className="p-4 sm:p-5 space-y-4">
        {/* Search + mobile toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by title, category, skills, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 sm:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Filter selects — always visible on sm+, collapsible on mobile */}
        <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${filtersOpen ? 'grid' : 'hidden sm:grid'}`}>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {DIFFICULTY_RANKS.map((rank) => (
                <SelectItem key={rank} value={rank}>
                  {rank}-Rank
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={track} onValueChange={(v) => setTrack(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              {TRACK_OPTIONS.filter((t) => isAdmin || t.value !== 'INTERN').map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(v) => setCategory(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {QUEST_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isBootcamp && (
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'all', label: 'All quests' },
              { value: 'solo', label: 'Solo quests' },
              { value: 'squad', label: 'Squad quests' },
            ] as const).map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={partyFilter === option.value ? 'default' : 'outline'}
                onClick={() => setPartyFilter(option.value)}
                className="rounded-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                className="flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 cursor-default pr-1"
              >
                {f.label}
                <button
                  onClick={f.clear}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-orange-300 transition-colors"
                  aria-label={`Remove ${f.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-orange-500 underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </GuildPanel>

      {filteredQuests.length === 0 ? (
        <GuildPanel className="p-12 text-center">
          <Target className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">No quests found</h3>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
          <Button className="mt-4" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </GuildPanel>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuests.map((quest) => (
            <GuildCard key={quest.id} className="border-slate-200/80">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="line-clamp-2 text-lg">{quest.title}</CardTitle>
                    <CardDescription className="mt-1 truncate">
                      Posted by {quest.company?.name || 'Unknown Company'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">{quest.questCategory}</Badge>
                  <Badge variant="outline" className="capitalize">{quest.questType.replace('_', ' ')}</Badge>
                  {quest.track && quest.track !== 'OPEN' && (
                    <Badge className="capitalize bg-orange-100 text-orange-700 border border-orange-300">
                      {quest.track.toLowerCase()}
                    </Badge>
                  )}
                  {(quest.maxParticipants ?? 1) <= 1 ? (
                    <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                      Solo
                    </Badge>
                  ) : (
                    <Badge className="border border-orange-300 bg-orange-100 text-orange-700">
                      Party: {getQuestPartySize(quest)}/{getQuestPartyCapacity(quest)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-slate-600">{quest.description}</p>

                {(quest.maxParticipants ?? 1) > 1 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Party members</p>
                        <p className="text-sm font-medium text-slate-900">
                          {getQuestPartySize(quest) > 0
                            ? `${getQuestPartySize(quest)} member${getQuestPartySize(quest) === 1 ? '' : 's'} joined`
                            : 'No party formed yet'}
                        </p>
                      </div>
                      {quest.party &&
                      getQuestPartySize(quest) < getQuestPartyCapacity(quest) &&
                      !isCurrentUserPartyMember(quest) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void joinParty(quest)}
                          disabled={joiningPartyId === quest.id}
                        >
                          {joiningPartyId === quest.id ? 'Joining...' : 'Join Party'}
                        </Button>
                      ) : null}
                    </div>

                    {quest.party && getQuestPartySize(quest) > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex -space-x-2">
                          {quest.party.members.slice(0, 4).map((member) => (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? 'Party member'} />
                              <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-700">
                                {getInitials(member.user.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {quest.party.members.length > 4 && (
                          <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            +{quest.party.members.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        Open squad slot{getQuestPartyCapacity(quest) > 1 ? 's' : ''} available for this quest.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    {quest.xpReward} XP
                  </div>
                  <div className="text-slate-700">{quest.skillPointsReward} SP</div>
                  {quest.monetaryReward && (
                    <div className="col-span-2 font-semibold text-emerald-600">
                      ${Number(quest.monetaryReward)} reward
                    </div>
                  )}
                </div>

                {quest.requiredSkills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {quest.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge key={`${quest.id}-${skill}`} variant="outline" className="text-[11px]">
                        {skill}
                      </Badge>
                    ))}
                    {quest.requiredSkills.length > 3 && (
                      <Badge variant="outline" className="text-[11px]">+{quest.requiredSkills.length - 3}</Badge>
                    )}
                  </div>
                )}

                {quest.deadline && (
                  <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Due {new Date(quest.deadline).toLocaleDateString()}
                  </div>
                )}

                <Button className="mt-4 w-full" asChild>
                  <Link href={`/dashboard/quests/${quest.id}`}>
                    View Quest Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </GuildCard>
          ))}
        </section>
      )}
    </GuildPage>
  );
}
