'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Sword, Users, Trophy } from 'lucide-react';
import type { PublicQuest } from '@/components/quest/PublicQuestCard';
import { PublicQuestGrid } from '@/components/quest/PublicQuestGrid';

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
        <PublicQuestGrid
          quests={quests}
          loading={loading}
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    </main>
  );
}
