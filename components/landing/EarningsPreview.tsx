'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Sparkles } from 'lucide-react';

type Stats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

const FALLBACK: Stats = {
  adventurers: 0,
  companies: 0,
  completedQuests: 0,
  openQuests: 0,
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

export default function EarningsPreview() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data: Stats) => setStats(data))
      .catch(() => setStats(FALLBACK));
  }, []);

  const isLoading = stats.adventurers === 0 && stats.openQuests === 0;

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-200"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              <Wallet className="h-3.5 w-3.5 text-orange-500" />
              <span>Start Earning At</span>
            </div>
            <p className="mt-4 text-[44px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
              F-Rank
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              You can claim your first paid quest the day you sign up. No
              interview, no portfolio review — just pick a quest and ship.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-200"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
              <span>Active Right Now</span>
            </div>
            <p className="mt-4 text-[44px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
              {isLoading ? '—' : formatNumber(stats.openQuests)}
              <span className="ml-1 text-[22px] font-semibold text-slate-500">
                quest{stats.openQuests === 1 ? '' : 's'}
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Real coding work posted by real companies. Each one pays when
              you deliver, and the pay is listed upfront — no surprises.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="rounded-2xl bg-slate-900 p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-800"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span>Climb To S-Rank</span>
            </div>
            <p className="mt-4 text-[44px] font-bold leading-none tracking-tight text-white tabular-nums">
              50K
              <span className="ml-1 text-[22px] font-semibold text-slate-400">
                XP
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              S-Rank is the top 1% of the Guild. Higher rank unlocks bigger
              payouts, enterprise quests, and direct invites from companies.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
