'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DIFFICULTY_RANKS, QUEST_CATEGORIES } from '@/lib/quest-constants';
import {
  AlertCircle,
  ArrowRight,
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

type SortOption = 'newest' | 'xp_desc' | 'pay_desc' | 'deadline_soon';
type TrackFilter = 'all' | 'OPEN' | 'INTERN' | 'BOOTCAMP';
type DifficultyFilter = 'all' | (typeof DIFFICULTY_RANKS)[number];
type CategoryFilter = 'all' | (typeof QUEST_CATEGORIES)[number]['value'];

const TRACK_OPTIONS: Array<{ value: TrackFilter; label: string }> = [
  { value: 'all', label: 'All Tracks' },
  { value: 'OPEN', label: 'Open' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'BOOTCAMP', label: 'Bootcamp' },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'xp_desc', label: 'Highest XP' },
  { value: 'pay_desc', label: 'Highest Pay' },
  { value: 'deadline_soon', label: 'Deadline Soon' },
];

const CATEGORY_LABELS = new Map<string, string>(QUEST_CATEGORIES.map((category) => [category.value, category.label]));

interface Quest {
  id: string;
  title: string;
  description: string;
  questType: string;
  status: string;
  difficulty: string;
  track: 'OPEN' | 'INTERN' | 'BOOTCAMP';
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  company?: {
    name: string;
    email: string;
  };
}

function getTrackLabel(track: TrackFilter | Quest['track']): string {
  return TRACK_OPTIONS.find((option) => option.value === track)?.label ?? track;
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS.get(category as CategoryFilter) ?? category.replace(/_/g, ' ');
}

function getSortLabel(sortBy: SortOption): string {
  return SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? 'Newest';
}

function getQuestTypeLabel(questType: string): string {
  return questType.replace(/_/g, ' ');
}

function getRewardAmount(monetaryReward?: number | string): number {
  return Number(monetaryReward ?? 0);
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const deferredSearchTerm = useDeferredValue(searchTerm.trim());

  const questQueryString = useMemo(() => {
    const params = new URLSearchParams({
      status: 'available',
      limit: '100',
      sort: sortBy,
    });

    if (deferredSearchTerm) {
      params.set('search', deferredSearchTerm);
    }

    if (difficultyFilter !== 'all') {
      params.set('difficulty', difficultyFilter);
    }

    if (trackFilter !== 'all') {
      params.set('track', trackFilter);
    }

    if (categoryFilter !== 'all') {
      params.set('category', categoryFilter);
    }

    return params.toString();
  }, [deferredSearchTerm, difficultyFilter, trackFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company');
      return;
    }

    let isCancelled = false;

    const fetchQuests = async () => {
      try {
        if (hasLoadedOnceRef.current) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(`/api/quests?${questQueryString}`);
        const data = await response.json();

        if (!data.success) {
          if (!isCancelled) {
            setError(data.error || 'Failed to fetch quests');
          }
          return;
        }

        if (!isCancelled) {
          setQuests(data.quests || []);
          hasLoadedOnceRef.current = true;
        }
      } catch (err) {
        console.error('Error fetching quests:', err);
        if (!isCancelled) {
          setError('An error occurred while fetching quests');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    if (status === 'authenticated') {
      fetchQuests();
    }

    return () => {
      isCancelled = true;
    };
  }, [status, session?.user?.role, router, questQueryString]);

  const filteredQuests = useMemo(() => {
    return [...quests].sort((leftQuest, rightQuest) => {
      switch (sortBy) {
        case 'xp_desc':
          return rightQuest.xpReward - leftQuest.xpReward;
        case 'pay_desc':
          return getRewardAmount(rightQuest.monetaryReward) - getRewardAmount(leftQuest.monetaryReward);
        case 'deadline_soon': {
          const leftDeadline = leftQuest.deadline ? new Date(leftQuest.deadline).getTime() : Number.POSITIVE_INFINITY;
          const rightDeadline = rightQuest.deadline ? new Date(rightQuest.deadline).getTime() : Number.POSITIVE_INFINITY;
          return leftDeadline - rightDeadline;
        }
        case 'newest':
        default:
          return new Date(rightQuest.createdAt).getTime() - new Date(leftQuest.createdAt).getTime();
      }
    });
  }, [quests, sortBy]);

  const activeFilters = useMemo(
    () =>
      [
        searchTerm
          ? {
              key: 'search' as const,
              label: `Search: ${searchTerm.length > 24 ? `${searchTerm.slice(0, 24)}...` : searchTerm}`,
            }
          : null,
        difficultyFilter !== 'all'
          ? { key: 'difficulty' as const, label: `Difficulty: ${difficultyFilter}` }
          : null,
        trackFilter !== 'all'
          ? { key: 'track' as const, label: `Track: ${getTrackLabel(trackFilter)}` }
          : null,
        categoryFilter !== 'all'
          ? { key: 'category' as const, label: `Category: ${getCategoryLabel(categoryFilter)}` }
          : null,
        sortBy !== 'newest'
          ? { key: 'sort' as const, label: `Sort: ${getSortLabel(sortBy)}` }
          : null,
      ].filter((filter): filter is { key: 'search' | 'difficulty' | 'track' | 'category' | 'sort'; label: string } => Boolean(filter)),
    [searchTerm, difficultyFilter, trackFilter, categoryFilter, sortBy]
  );

  const resetFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setTrackFilter('all');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  const clearFilter = (filterKey: 'search' | 'difficulty' | 'track' | 'category' | 'sort') => {
    switch (filterKey) {
      case 'search':
        setSearchTerm('');
        return;
      case 'difficulty':
        setDifficultyFilter('all');
        return;
      case 'track':
        setTrackFilter('all');
        return;
      case 'category':
        setCategoryFilter('all');
        return;
      case 'sort':
        setSortBy('newest');
        return;
    }
  };

  const filterControls = (stackClassName: string) => (
    <div className={stackClassName}>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty</p>
        <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            {DIFFICULTY_RANKS.map((rank) => (
              <SelectItem key={rank} value={rank}>
                {rank}-Rank
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Track</p>
        <Select value={trackFilter} onValueChange={(value) => setTrackFilter(value as TrackFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="All tracks" />
          </SelectTrigger>
          <SelectContent>
            {TRACK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {QUEST_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</p>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Newest" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-[320px] items-center justify-center">
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

      <GuildPanel className="p-4 sm:p-5">
        <div className="hidden gap-3 lg:grid lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <div className="space-y-1.5">
            <label htmlFor="quest-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="quest-search"
                placeholder="Search title or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {filterControls('grid gap-3 sm:grid-cols-2 lg:col-span-4 xl:grid-cols-4')}
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search title or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Refine by difficulty, track, category, or reward priority.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.length > 0 ? (
            <>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="outline"
                  className="flex items-center gap-1 rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-orange-700"
                >
                  {filter.label}
                  <button
                    type="button"
                    aria-label={`Clear ${filter.label}`}
                    className="rounded-full text-orange-500 transition hover:text-orange-700"
                    onClick={() => clearFilter(filter.key)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear all
              </Button>
            </>
          ) : (
            <p className="text-xs text-slate-500">Showing all visible quests, sorted by newest.</p>
          )}
        </div>

        {isRefreshing && (
          <p className="mt-3 text-xs text-slate-500">Updating quest results...</p>
        )}
      </GuildPanel>

      {filteredQuests.length === 0 ? (
        <GuildPanel className="p-12 text-center">
          <Target className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">No quests found</h3>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
          <Button className="mt-4" onClick={resetFilters}>Reset Filters</Button>
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
                  <Badge variant="secondary">{getCategoryLabel(quest.questCategory)}</Badge>
                  <Badge variant="outline" className="capitalize">{getQuestTypeLabel(quest.questType)}</Badge>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                    {getTrackLabel(quest.track)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-slate-600">{quest.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    {quest.xpReward} XP
                  </div>
                  <div className="text-slate-700">{quest.skillPointsReward} SP</div>
                  {quest.monetaryReward && (
                    <div className="col-span-2 font-semibold text-emerald-600">
                      ${getRewardAmount(quest.monetaryReward)} reward
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

      <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pr-8">
            <SheetTitle>Quest Filters</SheetTitle>
            <SheetDescription>
              Tune the board by difficulty, track, category, or how results are sorted.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">{filterControls('grid gap-4')}</div>

          <SheetFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={() => setIsMobileFiltersOpen(false)}>
              View {filteredQuests.length} quest{filteredQuests.length === 1 ? '' : 's'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </GuildPage>
  );
}
