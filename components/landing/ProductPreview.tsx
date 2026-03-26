'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Coins, ScrollText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

type PreviewQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  xpReward: number;
  monetaryReward: number | null;
  requiredSkills: string[];
};

interface ProductPreviewProps {
  quests: PreviewQuest[];
  completedQuests: number;
  companies: number;
  loading?: boolean;
}

const previewBullets = [
  'Browse real coding quests from companies',
  'Claim work that matches your rank',
  'Submit code, get reviewed, earn XP',
  'Your Guild Card proves what you can ship',
];

const numberFormatter = new Intl.NumberFormat('en-US');

function formatReward(reward: number | null) {
  return reward == null ? 'XP only' : `$${reward}`;
}

export default function ProductPreview({
  quests,
  completedQuests,
  companies,
  loading = false,
}: ProductPreviewProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.06),transparent_40%)]" />
      <div className="container relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-4 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.9)] sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/80">
                  Product Preview
                </p>
                <p className="mt-1 text-sm text-slate-300">Quest Board snapshot</p>
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                {loading ? 'Syncing live data' : `${quests.length} live cards`}
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                [0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-950/70"
                  />
                ))
              ) : quests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-white">The board is quiet for a moment.</p>
                  <p className="mt-2 text-sm text-slate-400">
                    New live quests appear here as soon as companies publish them.
                  </p>
                </div>
              ) : (
                quests.slice(0, 3).map((quest) => (
                  <div
                    key={quest.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-colors hover:border-orange-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{quest.company}</p>
                        <h3 className="text-base font-semibold text-white">{quest.title}</h3>
                      </div>
                      <RankBadge rank={quest.difficulty} size="sm" glow />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
                      {quest.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                        {quest.xpReward.toLocaleString()} XP
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                        {formatReward(quest.monetaryReward)}
                      </span>
                      {quest.requiredSkills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">
                Show the product first
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
                The guild makes shipping feel like progression.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Open the board, see real company work, and understand the loop before anyone asks for your email.
                Adventurers earn proof, not just points.
              </p>
            </div>

            <div className="space-y-3">
              {previewBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  <p className="text-sm text-slate-200">{bullet}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <ScrollText className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Completed</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {loading ? '--' : numberFormatter.format(completedQuests)}
                </p>
                <p className="mt-1 text-sm text-slate-400">quests already delivered through the guild</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Partners</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {loading ? '--' : numberFormatter.format(companies)}
                </p>
                <p className="mt-1 text-sm text-slate-400">companies already plugged into the quest pipeline</p>
              </div>
            </div>

            <Button asChild size="lg" className="h-12 rounded-xl px-6 text-sm">
              <Link href="/dashboard/quests" className="flex items-center gap-2">
                Browse the Quest Board
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <Coins className="h-3.5 w-3.5 text-orange-400" />
              Live preview pulled from the public quest and stats feeds
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
