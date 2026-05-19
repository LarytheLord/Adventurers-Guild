'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Clock, Coins, Filter, MapPin, Search, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: string;
  track: string;
  source: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-800/30',
  intermediate: 'bg-amber-500/15 text-amber-400 border-amber-800/30',
  advanced: 'bg-red-500/15 text-red-400 border-red-800/30',
};

const difficultyLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const diffKey = quest.difficulty?.toLowerCase() || 'beginner';
  const diffStyle = difficultyColors[diffKey] || difficultyColors.beginner;
  const diffLabel = difficultyLabel[diffKey] || 'Beginner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/quests/${quest.id}`} className="group block">
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-indigo-800/50 hover:bg-slate-900 hover:shadow-[0_0_30px_-8px_rgba(99,102,241,0.15)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
                  {quest.company.charAt(0)}
                </div>
                <span className="text-xs text-slate-500">{quest.company}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${diffStyle}`}>
                  {diffLabel}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold leading-snug text-white group-hover:text-indigo-300 transition-colors">
                {quest.title}
              </h3>

              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
                {quest.description}
              </p>

              {quest.requiredSkills && quest.requiredSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {quest.requiredSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                    >
                      {skill}
                    </span>
                  ))}
                  {quest.requiredSkills.length > 4 && (
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      +{quest.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2.5 py-1">
                <Zap className="h-3 w-3 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400">{quest.xpReward} XP</span>
              </div>
              {quest.monetaryReward && (
                <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1">
                  <Coins className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">${quest.monetaryReward}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Briefcase className="h-3 w-3" />
                {quest.applicants} applied
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function QuestCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-slate-800" />
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="h-4 w-16 rounded-full bg-slate-800" />
          </div>
          <div className="mt-3 h-5 w-3/4 rounded bg-slate-800" />
          <div className="mt-2 space-y-1">
            <div className="h-3 w-full rounded bg-slate-800/50" />
            <div className="h-3 w-2/3 rounded bg-slate-800/50" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-16 rounded-lg bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');

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

  const filtered = quests.filter((q) => {
    const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase()) || q.company.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === 'all' || q.difficulty?.toLowerCase() === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 pt-20 pb-16 md:pt-28 md:pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.08), transparent), radial-gradient(ellipse 60% 30% at 80% 100%, rgba(249,115,22,0.04), transparent)',
          }}
        />
        <div className="relative container mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-800/30 bg-indigo-950/30 px-3 py-1 text-xs text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Real quests from real companies
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Find your next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                development quest
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Browse open quests posted by companies looking for developers like you.
              No signup required to browse — just pick what interests you and join.
            </p>

            {/* Search + Filter */}
            <div className="mt-8 mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search quests by title, skill, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-600" />
                {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quest Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {loading ? 'Loading quests...' : `${filtered.length} quest${filtered.length !== 1 ? 's' : ''} available`}
              </h2>
              <p className="text-xs text-slate-500">
                Open to all skill levels
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuestCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                <BookOpen className="h-7 w-7 text-slate-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No quests found</h3>
              <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((quest, i) => (
                <QuestCard key={quest.id} quest={quest} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-slate-800/60 bg-slate-900/30 py-10">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" /> Apply in 2 minutes
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Hand-reviewed submissions
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
