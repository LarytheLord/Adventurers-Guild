'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { IndianRupee, Target, ChevronRight } from 'lucide-react';

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
  const [active, setActive] = useState<Rank>('F');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const current = ranks.find((r) => r.rank === active)!;
  const activeIndex = ranks.findIndex((r) => r.rank === active);

  return (
    <section id="ranks" ref={ref} className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
            The Rank Journey
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-slate-900 md:text-5xl">
            Start at F.<br />Climb to S.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Every rank is a real threshold. Your rank is your proof of work — no inflation, no shortcuts.
          </p>
        </motion.div>

        {/* Rank selector strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14 hidden md:block"
        >
          <div className="relative flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {/* Sliding pill */}
            <motion.div
              className="absolute h-[calc(100%-12px)] rounded-xl bg-slate-900"
              style={{ width: `calc(${100 / ranks.length}% - 6px)` }}
              animate={{ x: `calc(${activeIndex * 100}% + ${activeIndex * 4}px)` }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
            {ranks.map((r, i) => {
              const isActive = active === r.rank;
              const tierColors: Record<string, string> = {
                F: 'bg-slate-400',
                E: 'bg-emerald-400',
                D: 'bg-blue-400',
                C: 'bg-violet-400',
                B: 'bg-amber-400',
                A: 'bg-orange-400',
                S: 'bg-red-400',
              };
              return (
                <button
                  key={r.rank}
                  onClick={() => setActive(r.rank)}
                  className="relative z-10 flex flex-1 flex-col items-center gap-2 rounded-xl px-2 py-3 transition-colors"
                >
                  {/* Colored pip */}
                  <span className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${tierColors[r.rank]} ${isActive ? 'scale-125 shadow-md' : 'opacity-40'}`} />
                  <div className="text-center">
                    <p className={`text-[13px] font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      T{i + 1}
                    </p>
                    <p className={`text-[10px] transition-colors ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {r.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid md:grid-cols-[280px_1fr]"
              >
                {/* Left */}
                <div className="border-b border-slate-100 bg-slate-50 p-8 md:border-b-0 md:border-r">
                  <div className="flex items-center gap-4">
                    <RankBadge rank={current.rank} size="xl" glow />
                    <div>
                        <p className="text-3xl font-bold tracking-tight text-slate-900">
                        {current.rank}-Rank
                      </p>
                      <p className="text-sm text-slate-500">{current.label}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-slate-900 p-5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-400">
                      <IndianRupee className="h-3 w-3" />
                      <span>Typical Payout</span>
                    </div>
                    <p className="mt-2 text-[32px] font-bold leading-none tabular-nums text-white">
                      {current.payRange}
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-400">per quest</p>
                  </div>

                  <div className="mt-5 flex items-start gap-2 text-xs text-slate-500">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500/70" />
                    <span>{current.unlock}</span>
                  </div>
                </div>

                {/* Right */}
                <div className="p-8">
                  <p className="text-[15px] leading-relaxed text-slate-600">
                    {current.description}
                  </p>

                  <div className="mt-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Example Quests
                    </p>
                    <ul className="mt-4 space-y-3">
                      {current.examples.map((ex, i) => (
                        <motion.li
                          key={ex}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="flex items-center gap-3"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-sm text-slate-700">{ex}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* XP progress hint */}
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100" />
                    <p className="text-[11px] text-slate-400">
                      {current.xpNeeded.toLocaleString()} XP to unlock
                    </p>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile: vertical stack */}
        <div className="mt-10 space-y-2 md:hidden">
          {ranks.map((r, i) => {
            const isActive = active === r.rank;
            return (
              <motion.div
                key={r.rank}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isActive
                    ? 'border-orange-200 bg-orange-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setActive(isActive ? 'F' : r.rank)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <RankBadge rank={r.rank} size="md" glow={isActive} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {r.rank}-Rank · {r.label}
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-slate-600">
                      {r.xpNeeded.toLocaleString()} XP · {r.payRange}/quest
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isActive ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 px-4 pb-5 pt-4">
                        <p className="text-sm leading-relaxed text-slate-600">{r.description}</p>
                        <ul className="mt-4 space-y-2">
                          {r.examples.map((ex) => (
                            <li key={ex} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
