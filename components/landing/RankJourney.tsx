'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { IndianRupee, Target, ArrowUpRight } from 'lucide-react';

type RankData = {
  rank: Rank;
  label: string;
  xpNeeded: number;
  payRange: string;
  description: string;
  examples: string[];
  unlock: string;
};

const ranks: RankData[] = [
  {
    rank: 'F',
    label: 'Starter',
    xpNeeded: 0,
    payRange: '₹500–2K',
    description:
      'Your first week. Learn the Guild by completing small fixes that ship to a real product.',
    examples: ['Typo fixes', 'CSS adjustments', 'Copy edits'],
    unlock: 'The day you sign up',
  },
  {
    rank: 'E',
    label: 'Bug Hunter',
    xpNeeded: 500,
    payRange: '₹1.5K–5K',
    description:
      'Tackle bug reports from real codebases. Start reading other people\'s code.',
    examples: ['Fix failing tests', 'Error handling', 'Logging improvements'],
    unlock: 'After 1–2 weeks',
  },
  {
    rank: 'D',
    label: 'Feature Builder',
    xpNeeded: 1500,
    payRange: '₹3K–10K',
    description:
      'Build standalone features end to end. Get product requirements, ship, get paid.',
    examples: ['REST endpoints', 'UI components', 'Database queries'],
    unlock: 'After 1–2 months',
  },
  {
    rank: 'C',
    label: 'Squad Lead',
    xpNeeded: 4000,
    payRange: '₹8K–25K',
    description:
      'Lead small squads. Own larger features, review other people\'s code.',
    examples: ['API design', 'Code reviews', 'Technical specs'],
    unlock: 'After 3–4 months',
  },
  {
    rank: 'B',
    label: 'Architect',
    xpNeeded: 10000,
    payRange: '₹20K–60K',
    description:
      'Design system architecture. Mentor lower-rank adventurers on the team.',
    examples: ['System design', 'Performance tuning', 'Mentoring'],
    unlock: 'After 6–8 months',
  },
  {
    rank: 'A',
    label: 'Enterprise',
    xpNeeded: 25000,
    payRange: '₹50K–2L',
    description:
      'Production-scale work for funded startups and enterprise clients.',
    examples: ['Microservices', 'Security audits', 'SLA work'],
    unlock: 'After 10–12 months',
  },
  {
    rank: 'S',
    label: 'Legend',
    xpNeeded: 50000,
    payRange: '₹1L+',
    description:
      'Top 1% of the Guild. Direct invites, equity in select quests, leadership roles.',
    examples: ['Open source leads', 'Core infra', 'Community shaping'],
    unlock: 'Top 1% of all Adventurers',
  },
];

export default function RankJourney() {
  const [expanded, setExpanded] = useState<Rank | null>('F');

  return (
    <section id="ranks" className="bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500">
            The Rank Journey
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-5xl">
            Start at F. Climb to S. Get paid more at every step.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Every rank is a real threshold with a real payout range. There is no
            ranking inflation — your rank is your proof of work. Click any rank
            to see what unlocks.
          </p>
        </motion.div>

        {/* Desktop: horizontal progression */}
        <div className="mt-16 hidden md:block">
          <div className="grid grid-cols-7 gap-2">
            {ranks.map((r) => {
              const isActive = expanded === r.rank;
              return (
                <button
                  key={r.rank}
                  onClick={() => setExpanded(r.rank)}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all ${
                    isActive
                      ? 'border-orange-300 bg-orange-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <RankBadge
                    rank={r.rank}
                    size="lg"
                    glow={isActive}
                    className={isActive ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white' : ''}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                    <p className="mt-0.5 text-[11px] font-medium tabular-nums text-slate-500">
                      {r.xpNeeded.toLocaleString()} XP
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <AnimatePresence mode="wait">
              {ranks
                .filter((r) => r.rank === expanded)
                .map((r) => (
                  <motion.div
                    key={r.rank}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="grid gap-0 md:grid-cols-[260px_1fr]"
                  >
                    {/* Left: rank + pay */}
                    <div className="border-b border-slate-200 bg-white p-7 md:border-b-0 md:border-r">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={r.rank} size="xl" glow />
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{r.rank}-Rank</p>
                          <p className="text-sm text-slate-500">{r.label}</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl bg-slate-900 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          <IndianRupee className="h-3.5 w-3.5 text-orange-400" />
                          <span>Typical Payout</span>
                        </div>
                        <p className="mt-2 text-[28px] font-bold leading-none text-white tabular-nums">
                          {r.payRange}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-400">per quest</p>
                      </div>

                      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                        <span>{r.unlock}</span>
                      </div>
                    </div>

                    {/* Right: description + examples */}
                    <div className="p-7">
                      <p className="text-base leading-relaxed text-slate-700">
                        {r.description}
                      </p>

                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                          Example Quests
                        </p>
                        <ul className="mt-3 space-y-2">
                          {r.examples.map((ex) => (
                            <li
                              key={ex}
                              className="flex items-center gap-3 text-sm text-slate-700"
                            >
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-orange-500" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: vertical accordion */}
        <div className="mt-12 space-y-3 md:hidden">
          {ranks.map((r) => {
            const isActive = expanded === r.rank;
            return (
              <div
                key={r.rank}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isActive ? 'border-orange-300 bg-orange-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setExpanded(isActive ? null : r.rank)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <RankBadge rank={r.rank} size="md" glow={isActive} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.rank}-Rank · {r.label}
                    </p>
                    <p className="text-xs tabular-nums text-slate-500">
                      {r.xpNeeded.toLocaleString()} XP · {r.payRange} per quest
                    </p>
                  </div>
                </button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200 p-4">
                        <p className="text-sm text-slate-700">{r.description}</p>
                        <ul className="mt-3 space-y-1.5">
                          {r.examples.map((ex) => (
                            <li
                              key={ex}
                              className="flex items-center gap-2 text-xs text-slate-600"
                            >
                              <span className="h-1 w-1 rounded-full bg-orange-500" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
