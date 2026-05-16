'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView, motion } from 'framer-motion';
import { Sword, Users, Trophy, Zap, Clock, DollarSign, SearchX, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { Button } from '@/components/ui/button';

type PublicQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
};

type PublicStats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === 0) return;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
        <Icon className="h-5 w-5 text-orange-400" />
      </div>
      <div>
        <p className="text-xl font-bold text-white tabular-nums">{isInView ? count.toLocaleString() : '0'}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function PublicQuestsPage() {
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [questsRes, statsRes] = await Promise.all([
          fetch('/api/public/quests?limit=60'),
          fetch('/api/public/stats'),
        ]);
        if (!questsRes.ok) throw new Error('Failed to load quests');
        const questsData = await questsRes.json();
        const statsData = await statsRes.json();
        setQuests(questsData.quests ?? []);
        setStats(statsData);
      } catch {
        setError('Something went wrong loading quests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero header */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quest Board
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Browse open quests from partner companies. Real work, real pay, real XP.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <AnimatedCounter value={stats?.openQuests ?? 0} label="Open Quests" icon={Sword} />
            <AnimatedCounter value={stats?.adventurers ?? 0} label="Adventurers" icon={Users} />
            <AnimatedCounter value={stats?.completedQuests ?? 0} label="Quests Completed" icon={Trophy} />
          </div>
        </div>
      </div>

      {/* Quest grid */}
      <div className="container mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-5 animate-pulse">
                <div className="mb-4 h-6 w-12 rounded bg-slate-800" />
                <div className="mb-2 h-5 w-3/4 rounded bg-slate-800" />
                <div className="mb-3 h-3 w-1/2 rounded bg-slate-800" />
                <div className="mb-4 h-8 w-full rounded bg-slate-800" />
                <div className="mb-5 flex gap-1.5">
                  <div className="h-5 w-14 rounded bg-slate-800" />
                  <div className="h-5 w-16 rounded bg-slate-800" />
                </div>
                <div className="mb-4 h-px bg-slate-800" />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-4 rounded bg-slate-800" />
                  <div className="h-4 rounded bg-slate-800" />
                  <div className="h-4 rounded bg-slate-800" />
                  <div className="h-4 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400 text-sm">{error}</p>
            <Button
              variant="outline"
              className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : quests.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
            <SearchX className="mx-auto h-10 w-10 text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">No quests found</h3>
            <p className="mt-2 text-sm text-slate-400">No open quests right now — check back soon.</p>
            <Button asChild variant="outline" className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quests.map((quest, index) => (
              <Link key={quest.id} href={`/quests/${quest.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-600 transition-colors duration-200 h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <RankBadge rank={quest.difficulty} size="sm" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1 leading-snug line-clamp-2">{quest.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{quest.company}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{quest.description}</p>

                  {quest.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {quest.requiredSkills.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-400 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-slate-800 mb-4" />

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                      <span>{quest.xpReward.toLocaleString()} XP</span>
                    </div>
                    {quest.monetaryReward != null ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>${quest.monetaryReward}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                        <span>Unpaid</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDeadline(quest.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{quest.applicants} applied</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
