'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Code2, BookOpen, Sparkles } from 'lucide-react';

type Stats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

const FALLBACK: Stats = { adventurers: 0, companies: 0, completedQuests: 0, openQuests: 0 };

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

export default function TrustStrip() {
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data: Stats) => {
        setStats(data);
        setHasLoaded(true);
      })
      .catch(() => setHasLoaded(true));
  }, []);

  const signals = [
    {
      icon: Shield,
      label: 'Open Source',
      value: 'MIT',
      sub: 'Audit the code',
    },
    {
      icon: Code2,
      label: 'Stack',
      value: 'Next.js 15 + Neon',
      sub: 'Production-grade',
    },
    {
      icon: BookOpen,
      label: 'Backed by',
      value: 'Open Paws',
      sub: 'Bootcamp partner',
    },
    {
      icon: Sparkles,
      label: 'Infrastructure',
      value: 'BharatCode',
      sub: 'Free for students',
    },
  ];

  return (
    <section className="bg-white border-t border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 md:grid-cols-4">
          {signals.map((s) => (
            <div key={s.label} className="bg-white p-5">
              <div className="flex items-center gap-2">
                <s.icon className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {s.label}
                </p>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Real live numbers, second row */}
        {hasLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500"
          >
            <span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatNumber(stats.adventurers)}
              </span>{' '}
              Adventurers in the Guild
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:inline-block" />
            <span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatNumber(stats.completedQuests)}
              </span>{' '}
              Quests shipped
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:inline-block" />
            <span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatNumber(stats.openQuests)}
              </span>{' '}
              Open right now
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
