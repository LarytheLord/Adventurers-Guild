'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { RANK_THRESHOLDS } from '@/lib/ranks';

type JourneyQuest = {
  id: string;
  title: string;
  company: string;
  description: string;
  difficulty: Rank;
  xpReward: number;
  track: string;
  requiredSkills: string[];
};

interface RankJourneyProps {
  quests: JourneyQuest[];
  loading?: boolean;
}

const RANK_ORDER: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

const journeyCopy: Record<
  Rank,
  {
    title: string;
    unlock: string;
    summary: string;
  }
> = {
  F: {
    title: 'Tutorial Quests',
    unlock: 'Learn the guild loop and prove you can submit clean work.',
    summary: 'Your starting tier for onboarding, feedback, and first delivery reps.',
  },
  E: {
    title: 'Paired Bug Fixes',
    unlock: 'Step into small collaborative quests and tighter QA expectations.',
    summary: 'This is where consistency starts to matter more than raw speed.',
  },
  D: {
    title: 'Feature Delivery',
    unlock: 'Own meaningful slices of production work for real partners.',
    summary: 'D-rank is where companies start seeing you as someone who ships.',
  },
  C: {
    title: 'Lead Small Systems',
    unlock: 'Take on more architecture, coordination, and higher-signal quests.',
    summary: 'The guild begins to trust you with work that affects teams, not just tickets.',
  },
  B: {
    title: 'High-Leverage Missions',
    unlock: 'Unlock broader ownership, tougher technical constraints, and bigger reward bands.',
    summary: 'B-rank adventurers become the backbone of reliable delivery.',
  },
  A: {
    title: 'Enterprise Work',
    unlock: 'Handle critical integrations, tougher clients, and higher stakes.',
    summary: 'A-rank is senior territory where quality and judgment are expected.',
  },
  S: {
    title: 'Legend Status',
    unlock: "Reach the guild's top tier and become the benchmark for everyone below.",
    summary: 'S-rank represents sustained excellence, trust, and repeated high-impact shipping.',
  },
};

function getClosestQuest(quests: JourneyQuest[], rank: Rank) {
  if (quests.length === 0) {
    return null;
  }

  const desiredIndex = RANK_ORDER.indexOf(rank);

  return quests.reduce((best, quest) => {
    const questIndex = RANK_ORDER.indexOf(quest.difficulty);
    const bestDistance = Math.abs(RANK_ORDER.indexOf(best.difficulty) - desiredIndex);
    const questDistance = Math.abs(questIndex - desiredIndex);

    return questDistance < bestDistance ? quest : best;
  }, quests[0]);
}

export default function RankJourney({ quests, loading = false }: RankJourneyProps) {
  const [activeRank, setActiveRank] = useState<Rank>('F');

  const stops = useMemo(
    () =>
      RANK_THRESHOLDS.map((entry, index) => ({
        rank: entry.rank,
        threshold: entry.threshold,
        nextThreshold: RANK_THRESHOLDS[index + 1]?.threshold ?? null,
        ...journeyCopy[entry.rank],
        exampleQuest: getClosestQuest(quests, entry.rank),
      })),
    [quests]
  );

  const activeStop = stops.find((stop) => stop.rank === activeRank) ?? stops[0];

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(249,115,22,0.08),transparent_40%)]" />
      <div className="container relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500/80">Rank Journey</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-4xl">
            From F-rank apprentice to S-rank legend.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Hover or tap through the progression path to see what each rank unlocks and how the live board lines up today.
          </p>
        </motion.div>

        <div className="mt-12 lg:hidden">
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <button
                key={stop.rank}
                type="button"
                onClick={() => setActiveRank(stop.rank)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                  activeRank === stop.rank
                    ? 'border-orange-300 bg-orange-50 shadow-[0_16px_40px_-30px_rgba(249,115,22,0.55)]'
                    : 'border-slate-200 bg-white hover:border-orange-200'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <RankBadge rank={stop.rank} size="md" glow={activeRank === stop.rank} />
                  {index < stops.length - 1 ? <span className="h-8 w-px bg-orange-200" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">
                    {stop.threshold.toLocaleString()} XP
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{stop.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{stop.unlock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-12 hidden lg:block">
          <div className="pointer-events-none absolute left-12 right-12 top-[34px] h-1 rounded-full bg-gradient-to-r from-orange-200 via-orange-500 to-orange-200" />
          <div className="grid grid-cols-7 gap-3">
            {stops.map((stop) => (
              <button
                key={stop.rank}
                type="button"
                onMouseEnter={() => setActiveRank(stop.rank)}
                onFocus={() => setActiveRank(stop.rank)}
                onClick={() => setActiveRank(stop.rank)}
                className={`relative rounded-[24px] border px-3 py-5 text-center transition-all ${
                  activeRank === stop.rank
                    ? 'border-orange-300 bg-orange-50 shadow-[0_20px_45px_-34px_rgba(249,115,22,0.55)]'
                    : 'border-slate-200 bg-white hover:border-orange-200'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <RankBadge rank={stop.rank} size="lg" glow={activeRank === stop.rank} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500">
                      {stop.threshold.toLocaleString()} XP
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{stop.rank}</p>
                    <p className="mt-1 text-xs text-slate-500">{stop.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeStop.rank}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8 grid gap-6 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.45)] lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <RankBadge rank={activeStop.rank} size="lg" glow />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500">
                  {activeStop.threshold.toLocaleString()} XP threshold
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{activeStop.title}</h3>
              </div>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-900">{activeStop.unlock}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{activeStop.summary}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Entry</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {activeStop.rank === 'F'
                    ? 'Everyone starts here'
                    : `Reach ${activeStop.threshold.toLocaleString()} XP`}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Next unlock</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {activeStop.nextThreshold == null
                    ? 'Top tier achieved'
                    : `${activeStop.nextThreshold.toLocaleString()} XP`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/80">
                  Live example
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {activeStop.exampleQuest ? 'Closest current board match' : 'Waiting for the next drop'}
                </h3>
              </div>
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>

            {loading ? (
              <div className="mt-5 h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/80" />
            ) : activeStop.exampleQuest ? (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <RankBadge rank={activeStop.exampleQuest.difficulty} size="sm" glow />
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                    {activeStop.exampleQuest.track}
                  </span>
                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                    {activeStop.exampleQuest.xpReward.toLocaleString()} XP
                  </span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">{activeStop.exampleQuest.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{activeStop.exampleQuest.company}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {activeStop.exampleQuest.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeStop.exampleQuest.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <ArrowUpRight className="h-3.5 w-3.5 text-orange-400" />
                  Using live quest board data as the example feed
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/85 px-5 py-10">
                <p className="text-sm font-semibold text-white">No live quest matches this rank yet.</p>
                <p className="mt-2 text-sm text-slate-400">
                  The journey still reflects the real XP thresholds. The example panel updates automatically as new public quests go live.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
