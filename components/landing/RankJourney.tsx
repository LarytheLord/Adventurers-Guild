'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

type RankData = {
  rank: Rank;
  label: string;
  xpNeeded: number;
  description: string;
  examples: string[];
};

const ranks: RankData[] = [
  {
    rank: 'F',
    label: 'Tutorial Quests',
    xpNeeded: 0,
    description: 'Start here. Complete guided tutorials and learn the Guild interface.',
    examples: ['Git basics', 'First pull request', 'Environment setup'],
  },
  {
    rank: 'E',
    label: 'Bug Fixes',
    xpNeeded: 500,
    description: 'Tackle real bug reports. Learn to read existing codebases.',
    examples: ['CSS fixes', 'Error handling', 'Logging improvements'],
  },
  {
    rank: 'D',
    label: 'Features',
    xpNeeded: 1500,
    description: 'Build standalone features. Work with product requirements.',
    examples: ['REST endpoints', 'UI components', 'Database queries'],
  },
  {
    rank: 'C',
    label: 'Lead Work',
    xpNeeded: 4000,
    description: 'Own larger features. Coordinate with teams and review code.',
    examples: ['API design', 'Code reviews', 'Technical specs'],
  },
  {
    rank: 'B',
    label: 'Architecture',
    xpNeeded: 10000,
    description: 'Design system architecture. Mentor lower-rank adventurers.',
    examples: ['System design', 'Performance tuning', 'Mentoring'],
  },
  {
    rank: 'A',
    label: 'Enterprise',
    xpNeeded: 25000,
    description: 'Handle enterprise-grade projects with production-scale demands.',
    examples: ['Microservices', 'Security audits', 'SLA management'],
  },
  {
    rank: 'S',
    label: 'Legend',
    xpNeeded: 50000,
    description: 'Elite status. Reserved for top 1% of adventurers.',
    examples: ['Open source leads', 'Core infrastructure', 'Community shaping'],
  },
];

export default function RankJourney() {
  const [expanded, setExpanded] = useState<Rank | null>(null);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500/80">
            Rank Journey
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            From F to S
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
            Click any rank to see what unlocks at each level.
          </p>
        </motion.div>

        {/* Desktop timeline */}
        <div className="relative mt-16 hidden md:block">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-slate-200 via-orange-300 to-slate-200" />
          <div className="relative flex justify-between">
            {ranks.map((r) => (
              <div key={r.rank} className="flex flex-col items-center">
                <button
                  onClick={() => setExpanded(expanded === r.rank ? null : r.rank)}
                  className="relative z-10 transition-transform hover:scale-110"
                >
                  <RankBadge
                    rank={r.rank}
                    size="xl"
                    glow={expanded === r.rank}
                    className={expanded === r.rank ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white' : ''}
                  />
                </button>
                <p className="mt-3 text-xs font-semibold text-slate-700">{r.label}</p>
                <p className="text-[10px] text-slate-400">{r.xpNeeded.toLocaleString()} XP</p>

                <AnimatePresence>
                  {expanded === r.rank && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute top-28 z-20 w-64 rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
                    >
                      <p className="text-sm leading-relaxed text-slate-600">{r.description}</p>
                      <div className="mt-3 space-y-1">
                        {r.examples.map((ex) => (
                          <div key={ex} className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="h-1 w-1 rounded-full bg-orange-400" />
                            {ex}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="mt-12 space-y-6 md:hidden">
          {ranks.map((r, i) => (
            <div key={r.rank}>
              <button
                onClick={() => setExpanded(expanded === r.rank ? null : r.rank)}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-orange-200"
              >
                <RankBadge
                  rank={r.rank}
                  size="lg"
                  glow={expanded === r.rank}
                  className={expanded === r.rank ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white' : ''}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.xpNeeded.toLocaleString()} XP needed</p>
                </div>
              </button>
              <AnimatePresence>
                {expanded === r.rank && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 border-l-2 border-orange-200 pl-6 pt-3 pb-2">
                      <p className="text-sm text-slate-600">{r.description}</p>
                      <div className="mt-2 space-y-1">
                        {r.examples.map((ex) => (
                          <div key={ex} className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="h-1 w-1 rounded-full bg-orange-400" />
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
