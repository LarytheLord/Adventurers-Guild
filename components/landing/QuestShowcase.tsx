'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, Trophy, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

type PublicQuest = {
  id: string;
  title: string;
  company: string;
  difficulty: Rank;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  applicants: number;
};

type TopAdventurer = {
  id: string;
  name: string;
  rank: Rank;
  xp: number;
  level: number;
  questsCompleted: number;
  specialization: string | null;
  position: number;
};

function formatPay(n: number | null): string {
  if (n == null) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function formatDeadline(iso: string | null): string {
  if (!iso) return 'Open';
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  return `${days}d left`;
}

function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return `${xp}`;
}

const positionColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
const positionLabels = ['#1', '#2', '#3', '#4', '#5'];

export default function QuestBoard() {
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [adventurers, setAdventurers] = useState<TopAdventurer[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [advLoading, setAdvLoading] = useState(true);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });

  useEffect(() => {
    fetch('/api/public/quests?limit=5')
      .then((r) => r.json())
      .then((d) => setQuests(d.quests ?? []))
      .catch(() => setQuests([]))
      .finally(() => setQuestsLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/public/top-adventurers')
      .then((r) => r.json())
      .then((d) => setAdventurers(d.adventurers ?? []))
      .catch(() => setAdventurers([]))
      .finally(() => setAdvLoading(false));
  }, []);

  return (
    <section id="quests" ref={ref} className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
              Live on the Guild
            </p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900 md:text-[44px]">
              Real work. Real people.
            </h2>
          </div>
          <Link
            href="/quests"
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-slate-900 px-5 text-[13px] font-semibold text-white transition-all hover:bg-slate-800 md:self-auto"
          >
            Browse all quests
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* Two panels */}
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {/* Left: Quest Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="ml-1 rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                  guild.com/quests
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            {/* Quests */}
            {questsLoading ? (
              <div className="divide-y divide-slate-100">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : quests.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Zap className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">No open quests right now</p>
                <p className="mt-1 text-xs text-slate-500">New quests are posted every week.</p>
                <Link
                  href="/register"
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  Get notified <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quests.map((quest, i) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <RankBadge rank={quest.difficulty} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                        {quest.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{quest.company}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" />
                          {quest.applicants}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDeadline(quest.deadline)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-slate-900">
                        {formatPay(quest.monetaryReward)}
                      </p>
                      <p className="text-[10px] tabular-nums text-orange-500">
                        +{quest.xpReward} XP
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            {quests.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                <span className="text-[11px] text-slate-500">Showing {quests.length} open quests</span>
                <Link href="/quests" className="text-[11px] font-medium text-slate-700 hover:text-slate-900">
                  View all →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right: Top Adventurers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-[13px] font-semibold text-slate-900">Top Adventurers</span>
              </div>
              <span className="text-[11px] text-slate-400">by XP</span>
            </div>

            {/* Adventurers */}
            {advLoading ? (
              <div className="divide-y divide-slate-100">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : adventurers.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Trophy className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">No adventurers yet</p>
                <p className="mt-1 text-xs text-slate-500">Be the first to claim the top spot.</p>
                <Link
                  href="/register"
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  Join now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {adventurers.map((adv, i) => (
                  <motion.div
                    key={adv.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    {/* Position */}
                    <span className={`w-5 shrink-0 text-center text-[12px] font-bold tabular-nums ${i < 3 ? positionColors[i] : 'text-slate-300'}`}>
                      {positionLabels[i]}
                    </span>
                    <RankBadge rank={adv.rank} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-900">
                        {adv.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Level {adv.level}{adv.specialization ? ` · ${adv.specialization}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-slate-900">
                        {formatXP(adv.xp)} XP
                      </p>
                      <p className="text-[10px] text-slate-400 tabular-nums">
                        {adv.questsCompleted} quests
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <span className="text-[11px] text-slate-500">Updated live</span>
              <Link href="/register" className="text-[11px] font-medium text-slate-700 hover:text-slate-900">
                Join the Guild →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

