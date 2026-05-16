/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Zap,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Trophy,
  Sword,
  Building2,
} from 'lucide-react';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  F: 'F — Beginner',
  E: 'E — Intermediate',
  D: 'D — Advanced',
  C: 'C — Expert',
  B: 'B — Master',
  A: 'A — Grandmaster',
  S: 'S — Legendary',
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
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    fetchQuests();
    fetchCategories();
  }, [page]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
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
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/quests?categories=true');
      if (res.ok) {
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      }
    } catch {
      // Use fallback categories
      setCategories([
        'frontend', 'backend', 'fullstack', 'mobile',
        'ai_ml', 'devops', 'security', 'qa', 'design', 'data_science',
      ]);
    }
  };

  // Debounced search
  const handleSearch = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (query: string) => {
      setSearchQuery(query);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setPage(1);
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
        params.set('track', selectedTrack);
        params.set('page', '1');
        params.set('limit', '12');

        fetch(`/api/public/quests?${params.toString()}`)
          .then((r) => r.json())
          .then((data) => {
            setQuests(data.quests || []);
            setPagination(data.pagination || null);
            setLoading(false);
          })
          .catch(() => setError('Failed to load quests.'));
      }, 300);
    };
  }, [selectedCategory, selectedDifficulty, selectedTrack]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setPage(1);
    fetchQuests();
  };

  const totalQuests = pagination?.total ?? 0;

  const handleViewQuest = (questId: string) => {
    router.push(`/quests/${questId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="container px-6 mx-auto max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
              <Sword className="w-4 h-4" />
              <span>Open Quest Board</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Real Quests. Real XP. Real Pay.
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Browse coding quests posted by real companies. Complete them, earn
              verified XP and money, and build your rank from F to S — all backed
              by code review, not self-reported skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl px-8 bg-orange-500 hover:bg-orange-600 text-black font-semibold shadow-lg shadow-orange-500/20"
              >
                <Link href="/register" className="flex items-center gap-2">
                  <Sword className="w-4 h-4" />
                  Join the Guild
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Link href="#browse" className="flex items-center gap-2">
                  Browse Quests <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
                <p className="text-2xl font-bold text-orange-400" id="stat-quests">—</p>
                <p className="text-xs text-slate-500 mt-1">Open Quests</p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400" id="stat-adventurers">—</p>
                <p className="text-xs text-slate-500 mt-1">Adventurers</p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
                <p className="text-2xl font-bold text-violet-400" id="stat-completed">—</p>
                <p className="text-xs text-slate-500 mt-1">Completed</p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
                <p className="text-2xl font-bold text-amber-400" id="stat-companies">—</p>
                <p className="text-xs text-slate-500 mt-1">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Section */}
      <section id="browse" className="py-16 md:py-20">
        <div className="container px-6 mx-auto max-w-6xl">
          {/* Search & Filters */}
          <div className="mb-8">
            <Card className="border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Search quests by title, description, or company..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Quick Filters */}
                  <div className="flex gap-2">
                    <Button
                      variant={selectedTrack === 'OPEN' ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 rounded-lg whitespace-nowrap"
                      onClick={() => {
                        setSelectedTrack('OPEN');
                        setPage(1);
                      }}
                    >
                      All Open
                    </Button>
                    <Button
                      variant={selectedTrack === 'INTERN' ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 rounded-lg whitespace-nowrap"
                      onClick={() => {
                        setSelectedTrack('INTERN');
                        setPage(1);
                      }}
                    >
                      Intern
                    </Button>
                    <Button
                      variant={selectedTrack === 'BOOTCAMP' ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 rounded-lg whitespace-nowrap"
                      onClick={() => {
                        setSelectedTrack('BOOTCAMP');
                        setPage(1);
                      }}
                    >
                      Bootcamp
                    </Button>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-lg"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {filtersOpen ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Advanced Filters */}
                {filtersOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Category
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(v) => {
                          setSelectedCategory(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat: string) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_ICONS[cat] || ''}{' '}
                              {formatCategory(cat)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Difficulty
                      </label>
                      <Select
                        value={selectedDifficulty}
                        onValueChange={(v) => {
                          setSelectedDifficulty(v);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-sm">
                          <SelectValue placeholder="All Ranks" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="all">All Ranks</SelectItem>
                          {Object.keys(DIFFICULTY_LABELS).map((rank: string) => (
                            <SelectItem key={rank} value={rank}>
                              {DIFFICULTY_LABELS[rank as Rank]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        className="h-10 w-full text-slate-400 hover:text-white"
                        onClick={resetFilters}
                      >
                        ✕ Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quest Grid */}
          {loading && !error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <QuestCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <ShieldCheck className="w-16 h-16 mx-auto text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {error}. Try refreshing the page.
              </p>
              <Button onClick={() => {
                setError(null);
                setLoading(true);
                fetchQuests();
              }}>
                Try Again
              </Button>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-20">
              <Sword className="w-16 h-16 mx-auto text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">
                No quests found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {searchQuery
                  ? `No quests match "${searchQuery}". Try different keywords.`
                  : 'No open quests right now. Check back soon or join as an adventurer to be first in line.'}
              </p>
              <Button asChild>
                <Link href="/register">
                  <Sword className="w-4 h-4 mr-2" />
                  Join the Guild
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {quests.length} of {totalQuests} quests
                </p>
                <Badge variant="secondary" className="text-xs">
                  {selectedTrack === 'OPEN' && '🌐 Open Track'}
                  {selectedTrack === 'INTERN' && '🎓 Intern Track'}
                  {selectedTrack === 'BOOTCAMP' && '📚 Bootcamp Track'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {quests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onClick={() => handleViewQuest(quest.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() =>
                      setPage((p) => Math.min(pagination!.pages, p + 1))
                    }
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-4">
              <Trophy className="w-4 h-4" />
              <span>Start Your Journey</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Level Up?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Join the Guild for free. Complete quests, earn XP, rank up, and
              build a career backed by verifiable work — not just a resume.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl px-8 bg-orange-500 hover:bg-orange-600 text-black font-semibold"
              >
                <Link href="/register">
                  <Sword className="w-4 h-4 mr-2" />
                  Register as Adventurer
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Link href="/register-company">
                  <Building2 className="w-4 h-4 mr-2" />
                  Register as Company
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuestCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
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
    <div
      className="rounded-xl border border-slate-800/60 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700/80 transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <RankBadge rank={quest.difficulty} size="sm" glow />
          <Badge
            variant="secondary"
            className="text-[10px] capitalize bg-slate-800/60 text-slate-400 border-slate-700"
          >
            {quest.questCategory}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-white leading-snug mb-2 group-hover:text-orange-400 transition-colors">
          {quest.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm text-slate-500">{quest.company}</span>
          {quest.maxParticipants && quest.maxParticipants > 1 && (
            <span className="text-xs text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">
              <Users className="w-3 h-3 inline mr-1" />
              {quest.maxParticipants} members
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {quest.description}
        </p>

        {/* Skills */}
        {quest.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {quest.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[10px] px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 rounded-md text-slate-400 font-medium"
              >
                {skill}
              </span>
            ))}
            {quest.requiredSkills.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 text-slate-600">
                +{quest.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-800/60 mb-4" />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-orange-400/70" />
            <span>{quest.xpReward.toLocaleString()} XP</span>
          </div>
          {quest.monetaryReward != null ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400/70" />
              <span>${quest.monetaryReward}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <DollarSign className="w-3.5 h-3.5" />
              <span>XP only</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDeadline(quest.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-900/30 border-t border-slate-800/40 flex items-center justify-between">
        <span className="text-xs text-slate-600 flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          {quest.applicants} applied
        </span>
        <span className="text-xs font-medium text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          View details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}