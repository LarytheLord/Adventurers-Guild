/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Filter,
  Search,
  ShieldCheck,
  Sparkles,
  Sword,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Quest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  track: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
  questCategory: string;
  maxParticipants: number | null;
  createdAt: string;
};

const DIFFICULTY_LABELS: Record<Rank, string> = {
  F: 'Tier 1 - Novice',
  E: 'Tier 2 - Apprentice',
  D: 'Tier 3 - Journeyman',
  C: 'Tier 4 - Expert',
  B: 'Tier 5 - Master',
  A: 'Tier 6 - Champion',
  S: 'Tier 7 - Legend',
};

const CATEGORY_ICONS: Record<string, string> = {
  frontend: '🌐',
  backend: '⚙️',
  fullstack: '🔄',
  mobile: '📱',
  ai_ml: '🤖',
  devops: '🚀',
  security: '🔒',
  qa: '🧪',
  design: '🎨',
  data_science: '📊',
};

const TRACK_OPTIONS = [
  {
    value: 'OPEN',
    label: 'Open Track',
    shortLabel: 'Open',
    description: 'Paid work from live company quests',
  },
  {
    value: 'INTERN',
    label: 'Intern Track',
    shortLabel: 'Intern',
    description: 'Longer-run proving grounds for internships',
  },
  {
    value: 'BOOTCAMP',
    label: 'Bootcamp Track',
    shortLabel: 'Bootcamp',
    description: 'Structured learning with hands-on outputs',
  },
] as const;

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(amount: number | null): string {
  if (amount == null) return 'XP only';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('OPEN');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    pages: number;
    current: number;
    limit: number;
  } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      params.set('track', selectedTrack);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/public/quests?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch quests');

      const data = await res.json();
      setQuests(data.quests || []);
      setPagination(data.pagination || null);
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      setError('Failed to load quests. Please try again later.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, selectedCategory, selectedDifficulty, selectedTrack]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/public/quests?categories=true');
      if (!res.ok) throw new Error('Failed to fetch categories');

      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {
      setCategories([
        'frontend',
        'backend',
        'fullstack',
        'mobile',
        'ai_ml',
        'devops',
        'security',
        'qa',
        'design',
        'data_science',
      ]);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedTrack('OPEN');
    setPage(1);
  };

  const totalQuests = pagination?.total ?? 0;
  const totalXpVisible = quests.reduce((sum, quest) => sum + quest.xpReward, 0);
  const totalApplicantsVisible = quests.reduce((sum, quest) => sum + quest.applicants, 0);
  const paidQuestCount = quests.filter((quest) => quest.monetaryReward != null).length;
  const activeTrack = TRACK_OPTIONS.find((option) => option.value === selectedTrack) ?? TRACK_OPTIONS[0];
  const highlightedCategories = useMemo(() => categories.slice(0, 6), [categories]);

  const handleViewQuest = (questId: string) => {
    router.push(`/quests/${questId}`);
  };

  return (
    <div className="min-h-screen bg-background ds-page-grain">
      <section className="relative overflow-hidden border-b border-border/70 bg-background pt-24 md:pt-32">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_58%)]" />
        <div className="absolute right-[-8rem] top-20 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute left-[-6rem] top-40 h-48 w-48 rounded-full bg-amber-100/80 blur-3xl" />

        <div className="ds-container relative pb-16 md:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
                <Sword className="h-3.5 w-3.5" />
                Open Quest Board
              </div>

              <h1 className="ds-display mt-6 max-w-4xl font-display text-[2.9rem] text-slate-950 md:text-[4.5rem]">
                Real projects from real companies, styled like the rest of your Guild journey.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Browse work that actually matters. Pick a quest, ship something useful, earn XP and
                money, and build a reputation grounded in delivery instead of empty bullet points.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-slate-950 px-7 text-white hover:bg-slate-800"
                >
                  <Link href="/register" className="flex items-center gap-2">
                    Start at Tier 1
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-slate-300 bg-white/80 px-7 text-slate-700 hover:bg-slate-100"
                >
                  <Link href="#browse">Explore live quests</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                value={String(totalQuests || '12+')}
                label="Quests in this track"
                tone="orange"
                detail={activeTrack.shortLabel}
              />
              <StatCard
                value={String(totalApplicantsVisible || '200+')}
                label="Applications on visible quests"
                tone="slate"
                detail="Live demand"
              />
              <StatCard
                value={`${totalXpVisible || 1000}+`}
                label="XP across this page"
                tone="amber"
                detail="Reputation fuel"
              />
              <StatCard
                value={String(paidQuestCount || quests.length || '8')}
                label="Paid quests visible"
                tone="emerald"
                detail="Cash + XP"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {TRACK_OPTIONS.map((option) => {
              const active = selectedTrack === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedTrack(option.value);
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]'
                      : 'border-border/70 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{option.label}</p>
                    {active && <Sparkles className="h-4 w-4 text-orange-300" />}
                  </div>
                  <p className={cn('mt-2 text-sm leading-6', active ? 'text-slate-300' : 'text-slate-500')}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="browse" className="ds-section-sm">
        <div className="ds-container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="ds-label text-orange-500">Browse The Board</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
                Find the kind of work you actually want to be known for.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500 md:text-right">
              Filter by category, tier, and track. Every card here is meant to feel like part of the
              same editorial system as the rest of the site, not a separate dashboard.
            </p>
          </div>

          <div className="ds-card mb-8 overflow-hidden rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="border-b border-border/70 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by title, company, or the kind of work you want to do..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {TRACK_OPTIONS.map((option) => {
                    const active = selectedTrack === option.value;
                    return (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-10 rounded-full border px-4',
                          active
                            ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        )}
                        onClick={() => {
                          setSelectedTrack(option.value);
                          setPage(1);
                        }}
                      >
                        {option.shortLabel}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-full px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {filtersOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {highlightedCategories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlightedCategories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(active ? 'all' : cat);
                          setPage(1);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? 'border-orange-200 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        )}
                      >
                        <span className="mr-1">{CATEGORY_ICONS[cat] || '✨'}</span>
                        {formatCategory(cat)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {filtersOpen && (
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_1fr_auto] md:px-6">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat] || '✨'} {formatCategory(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Difficulty
                  </label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value) => {
                      setSelectedDifficulty(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {Object.keys(DIFFICULTY_LABELS).map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {DIFFICULTY_LABELS[rank as Rank]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200 bg-white px-5 text-slate-600 hover:bg-slate-100"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {loading && !error ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <QuestCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="ds-card rounded-[28px] px-6 py-20 text-center">
              <ShieldCheck className="mx-auto h-14 w-14 text-slate-300" />
              <h3 className="mt-5 text-xl font-semibold text-slate-800">Something went wrong</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                {error} Refresh the board and we&apos;ll try pulling the live quests again.
              </p>
              <Button
                className="mt-6 rounded-xl bg-slate-950 px-6 text-white hover:bg-slate-800"
                onClick={() => fetchQuests()}
              >
                Try again
              </Button>
            </div>
          ) : quests.length === 0 ? (
            <div className="ds-card rounded-[28px] px-6 py-20 text-center">
              <Sword className="mx-auto h-14 w-14 text-orange-300" />
              <h3 className="mt-5 text-xl font-semibold text-slate-800">No quests found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                {searchQuery
                  ? `No quests match "${searchQuery}". Try a broader search or another track.`
                  : 'Nothing is open in this slice right now. Join the Guild and we will put you first in line when fresh work lands.'}
              </p>
              <Button asChild className="mt-6 rounded-xl bg-slate-950 px-6 text-white hover:bg-slate-800">
                <Link href="/register">
                  Join the Guild
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>
                    Showing {quests.length} of {totalQuests} quests
                  </span>
                  <span className="hidden text-slate-300 md:inline">/</span>
                  <span>{activeTrack.label}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                    {totalXpVisible.toLocaleString()} XP visible
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {paidQuestCount} paid quests
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {quests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onClick={() => handleViewQuest(quest.id)} />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-100"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Prev
                  </Button>
                  <span className="text-sm text-slate-500">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-100"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="mt-16 overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-center text-white shadow-[0_25px_60px_rgba(15,23,42,0.18)] md:px-10">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">
              <Trophy className="h-3.5 w-3.5" />
              Start Your Journey
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
              Build proof, not just a profile.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Join the Guild, complete work that companies actually care about, and let your rank be
              earned in public through shipped outcomes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-orange-500 px-8 font-semibold text-slate-950 hover:bg-orange-400"
              >
                <Link href="/register">
                  Register as Adventurer
                  <Sword className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-transparent px-8 text-white hover:bg-white/10"
              >
                <Link href="/company">
                  Register as Company
                  <Building2 className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  value,
  label,
  detail,
  tone,
}: {
  value: string;
  label: string;
  detail: string;
  tone: 'orange' | 'slate' | 'amber' | 'emerald';
}) {
  const toneClasses = {
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    slate: 'text-slate-700 bg-slate-50 border-slate-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className={cn('inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]', toneClasses[tone])}>
        {detail}
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function QuestCardSkeleton() {
  return (
    <div className="ds-card overflow-hidden rounded-[28px] border-white/80 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-7 w-4/5 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-2/5 rounded-lg" />
      <Skeleton className="mt-5 h-16 w-full rounded-xl" />
      <div className="mt-5 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-full rounded-lg" />
      </div>
    </div>
  );
}

function QuestCard({
  quest,
  onClick,
}: {
  quest: Quest;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group ds-card ds-card-hover flex h-full flex-col overflow-hidden rounded-[28px] border-white/80 bg-white/92 text-left shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-100"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <RankBadge rank={quest.difficulty} size="sm" />
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-600">
            {formatCategory(quest.questCategory)}
          </Badge>
        </div>

        <h3 className="mt-5 text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-orange-600">
          {quest.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {quest.company}
          </span>
          {quest.maxParticipants && quest.maxParticipants > 1 && (
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
              Team of {quest.maxParticipants}
            </span>
          )}
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">{quest.description}</p>

        {quest.requiredSkills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {quest.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
            {quest.requiredSkills.length > 4 && (
              <span className="rounded-full border border-transparent bg-transparent px-1 py-1 text-[11px] font-medium text-slate-400">
                +{quest.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <QuestMeta icon={Zap} label="XP" value={`${quest.xpReward.toLocaleString()} XP`} accent="text-orange-500" />
          <QuestMeta
            icon={DollarSign}
            label="Reward"
            value={formatMoney(quest.monetaryReward)}
            accent={quest.monetaryReward != null ? 'text-emerald-500' : 'text-slate-400'}
          />
          <QuestMeta icon={Clock} label="Deadline" value={formatDeadline(quest.deadline)} accent="text-slate-400" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          {quest.applicants} applied
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          View details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

function QuestMeta({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Icon className={cn('h-3.5 w-3.5', accent)} />
        <span className="text-sm font-medium text-slate-700">{value}</span>
      </div>
    </div>
  );
}
