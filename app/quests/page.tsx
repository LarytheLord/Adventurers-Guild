'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Coins,
  Grid3X3,
  List,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { CardGridSkeleton, Skeleton } from '@/components/ui/skeleton';

interface Quest {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: string;
  track: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
}

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';
type ViewMode = 'grid' | 'list';

const difficultyMeta: Record<string, { label: string; color: string; ring: string }> = {
  beginner: {
    label: 'Beginner',
    color: 'text-emerald-400',
    ring: 'ring-emerald-800/30 bg-emerald-500/8',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-amber-400',
    ring: 'ring-amber-800/30 bg-amber-500/8',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-red-400',
    ring: 'ring-red-800/30 bg-red-500/8',
  },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const meta = difficultyMeta[difficulty?.toLowerCase()] || difficultyMeta.beginner;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.color} ring-1 ${meta.ring}`}
    >
      {meta.label}
    </span>
  );
}

function QuestCardGrid({ quest, index }: { quest: Quest; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/quests/${quest.id}`} className="group block h-full">
        <GlassCard className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 ring-1 ring-indigo-800/30">
                <span className="text-[10px] font-bold text-indigo-400">
                  {quest.company.charAt(0)}
                </span>
              </div>
              <span className="truncate text-xs text-slate-500">{quest.company}</span>
            </div>
            <DifficultyBadge difficulty={quest.difficulty} />
          </div>

          <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-200 transition-colors group-hover:text-indigo-300">
            {quest.title}
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2 flex-1">
            {quest.description}
          </p>

          {quest.requiredSkills && quest.requiredSkills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quest.requiredSkills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                >
                  {skill}
                </span>
              ))}
              {quest.requiredSkills.length > 3 && (
                <span className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-600">
                  +{quest.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 border-t border-slate-800/40 pt-3">
            <div className="flex items-center gap-1.5 rounded-md bg-indigo-500/8 px-2 py-1">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-[11px] font-semibold text-indigo-400">{quest.xpReward}</span>
            </div>
            {quest.monetaryReward && (
              <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/8 px-2 py-1">
                <Coins className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">
                  ${quest.monetaryReward}
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
              <Briefcase className="h-3 w-3" />
              {quest.applicants}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function QuestCardList({ quest }: { quest: Quest }) {
  return (
    <Link href={`/quests/${quest.id}`} className="group block">
      <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-all hover:border-slate-700/60 hover:bg-slate-900/80">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 ring-1 ring-indigo-800/30">
          <span className="text-sm font-bold text-indigo-400">{quest.company.charAt(0)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-slate-200 group-hover:text-indigo-300">
              {quest.title}
            </h3>
            <DifficultyBadge difficulty={quest.difficulty} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{quest.company}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-indigo-500/8 px-2 py-1">
            <Zap className="h-3 w-3 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">{quest.xpReward}</span>
          </div>
          {quest.monetaryReward && (
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/8 px-2 py-1">
              <span className="text-xs font-semibold text-emerald-400">${quest.monetaryReward}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const categories = [
  { id: 'all', label: 'All Quests', icon: Sparkles },
  { id: 'frontend', label: 'Frontend', icon: Grid3X3 },
  { id: 'backend', label: 'Backend', icon: Grid3X3 },
  { id: 'fullstack', label: 'Full Stack', icon: Grid3X3 },
  { id: 'devops', label: 'DevOps', icon: Grid3X3 },
  { id: 'mobile', label: 'Mobile', icon: Grid3X3 },
  { id: 'ai', label: 'AI/ML', icon: Grid3X3 },
];

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [category, setCategory] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    async function fetchQuests() {
      try {
        const res = await fetch('/api/public/quests');
        const data = await res.json();
        setQuests(data.quests || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchQuests();
  }, []);

  const filtered = useMemo(
    () =>
      quests.filter((q) => {
        const qs = search.toLowerCase();
        const matchesSearch =
          !qs ||
          q.title.toLowerCase().includes(qs) ||
          q.description.toLowerCase().includes(qs) ||
          q.company.toLowerCase().includes(qs) ||
          q.requiredSkills?.some((s) => s.toLowerCase().includes(qs));

        const matchesDifficulty =
          difficulty === 'all' || q.difficulty?.toLowerCase() === difficulty;

        const matchesCategory =
          category === 'all' || q.track?.toLowerCase() === category;

        return matchesSearch && matchesDifficulty && matchesCategory;
      }),
    [quests, search, difficulty, category]
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-800/60 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Vercel-style dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.06), transparent), radial-gradient(ellipse 60% 30% at 80% 100%, rgba(249,115,22,0.03), transparent)',
          }}
        />

        <div className="relative container mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-800/25 bg-indigo-950/30 px-3 py-1 text-[11px] font-medium text-indigo-300"
            >
              <Sparkles className="h-3 w-3" />
              {loading ? 'Loading quests...' : `${quests.length} open quest${quests.length !== 1 ? 's' : ''}`}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-5xl"
            >
              Find your next
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                development quest
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-500"
            >
              Browse real coding tasks from companies looking for talent.
              No signup needed to explore — apply when you&apos;re ready.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mx-auto mt-8 max-w-xl"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by title, skill, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-600/40 focus:ring-1 focus:ring-indigo-600/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    &times;
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="border-b border-slate-800/40 bg-slate-900/30">
        <div className="container mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right: difficulty + view toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5 ring-1 ring-slate-800">
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                      difficulty === d
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5 ring-1 ring-slate-800">
                <button
                  onClick={() => setView('grid')}
                  className={`rounded-md p-1.5 transition-all ${
                    view === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`rounded-md p-1.5 transition-all ${
                    view === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-6xl px-6">
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/50">
                <Search className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">No quests match your filters</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setDifficulty('all');
                  setCategory('all');
                }}
                className="mt-5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {filtered.length} of {quests.length} quest
                  {quests.length !== 1 ? 's' : ''}
                </p>
              </div>

              {view === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((quest, i) => (
                    <QuestCardGrid key={quest.id} quest={quest} index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((quest) => (
                    <QuestCardList key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-slate-800/40 bg-slate-900/30 py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-lg text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-800/25 bg-indigo-950/30 px-3 py-1 text-[11px] font-medium text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Start your adventure today
            </div>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">
              Ready to start your journey?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Join hundreds of developers earning real income through quest-based work.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <GlowButton size="lg">
                  Create Free Account <Zap className="h-4 w-4" />
                </GlowButton>
              </Link>
              <Link href="/register-company">
                <GlowButton variant="secondary" size="lg">
                  I&apos;m a Company
                </GlowButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
