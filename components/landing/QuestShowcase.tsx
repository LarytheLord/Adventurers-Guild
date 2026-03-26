'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, DollarSign, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

type PublicQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  track: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
};

interface QuestShowcaseProps {
  quests: PublicQuest[];
  loading?: boolean;
}

const difficultyPillStyles: Record<Rank, string> = {
  F: 'border-slate-700 bg-slate-900 text-slate-300',
  E: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  D: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
  C: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
  B: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  A: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
  S: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
};

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function QuestShowcase({ quests, loading = false }: QuestShowcaseProps) {
  return (
    <section className="bg-slate-950 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/60">
              Live quests
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
              Real work from real companies
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Fresh opportunities on the public board, with difficulty, reward, and delivery signal visible at a glance.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[28px] border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <Sparkles className="h-6 w-6 text-orange-400" />
            </div>
            <p className="mt-5 text-lg font-semibold text-white">The next quest drop is loading.</p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
              Companies publish to this board in waves. Create your account now and you will be ready the moment the next brief goes live.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Link href="/register">Join the Guild</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quests.map((quest, index) => (
              <motion.article
                key={quest.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`rounded-[28px] border bg-slate-900 p-5 transition-colors duration-200 ${
                  index === 0 ? 'border-orange-500/30' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={quest.difficulty} size="sm" glow={index === 0} />
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${difficultyPillStyles[quest.difficulty]}`}
                    >
                      {quest.difficulty}-Rank
                    </span>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    {quest.track}
                  </span>
                </div>

                <h3 className="mb-1 text-base font-semibold leading-snug text-white">{quest.title}</h3>
                <p className="mb-3 text-xs text-slate-500">{quest.company}</p>
                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-400">{quest.description}</p>

                {quest.requiredSkills.length > 0 ? (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {quest.requiredSkills.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mb-4 h-px bg-slate-800" />

                <div className="grid grid-cols-2 gap-2.5">
                  <Stat icon={<Zap className="h-3.5 w-3.5 text-orange-400" />} value={`${quest.xpReward.toLocaleString()} XP`} />
                  {quest.monetaryReward != null ? (
                    <Stat icon={<DollarSign className="h-3.5 w-3.5 text-emerald-400" />} value={`$${quest.monetaryReward}`} />
                  ) : (
                    <Stat icon={<DollarSign className="h-3.5 w-3.5 text-slate-600" />} value="XP only" />
                  )}
                  <Stat icon={<Clock className="h-3.5 w-3.5 text-slate-500" />} value={formatDeadline(quest.deadline)} />
                  <Stat icon={<Users className="h-3.5 w-3.5 text-slate-500" />} value={`${quest.applicants} applied`} />
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-slate-700 bg-transparent px-6 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Link href="/dashboard/quests" className="flex items-center gap-2 text-sm">
              View All Quests
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      {icon}
      <span>{value}</span>
    </div>
  );
}
