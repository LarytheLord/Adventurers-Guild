'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Code2,
  TrendingUp,
  Brain,
  MessageSquareCode,
  Briefcase,
  Zap,
  Users,
  Layers,
} from 'lucide-react';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

const ranks = [
  { rank: 'S' as const, pct: 100 },
  { rank: 'A' as const, pct: 85 },
  { rank: 'B' as const, pct: 70 },
  { rank: 'C' as const, pct: 55 },
  { rank: 'D' as const, pct: 40 },
  { rank: 'E' as const, pct: 25 },
  { rank: 'F' as const, pct: 12 },
];

const rankBarColors: Record<string, string> = {
  S: 'bg-red-500 shadow-[0_0_12px_-2px_rgba(239,68,68,0.4)]',
  A: 'bg-orange-500 shadow-[0_0_12px_-2px_rgba(249,115,22,0.4)]',
  B: 'bg-amber-400 shadow-[0_0_12px_-2px_rgba(251,191,36,0.4)]',
  C: 'bg-violet-500 shadow-[0_0_12px_-2px_rgba(139,92,246,0.4)]',
  D: 'bg-blue-500 shadow-[0_0_12px_-2px_rgba(59,130,246,0.4)]',
  E: 'bg-emerald-500 shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]',
  F: 'bg-slate-500 shadow-[0_0_12px_-2px_rgba(100,116,139,0.3)]',
};

type PublicQuest = {
  id: string;
  title: string;
  difficulty: Rank;
};

type PublicStats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

const cardsMeta = [
  {
    icon: Briefcase,
    accent: 'from-indigo-500/20 to-indigo-600/5',
    borderAccent: 'group-hover:border-indigo-500/40',
    glow: 'shadow-indigo-500/10',
  },
  {
    icon: TrendingUp,
    accent: 'from-amber-500/20 to-amber-600/5',
    borderAccent: 'group-hover:border-amber-500/40',
    glow: 'shadow-amber-500/10',
  },
  {
    icon: Zap,
    accent: 'from-emerald-500/20 to-emerald-600/5',
    borderAccent: 'group-hover:border-emerald-500/40',
    glow: 'shadow-emerald-500/10',
  },
  {
    icon: MessageSquareCode,
    accent: 'from-purple-500/20 to-purple-600/5',
    borderAccent: 'group-hover:border-purple-500/40',
    glow: 'shadow-purple-500/10',
  },
];

export default function BentoGrid() {
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch('/api/public/quests')
      .then((r) => r.json())
      .then((d) => setQuests(d.quests ?? []))
      .catch(() => {});
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 md:py-28">
      {/* Subtle section gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_60%)]" />

      <div className="container relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400/60">
            Why the Guild
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Not your average coding platform
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Real projects, real pay, real code reviews. Build a career on shipped work, not certificates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* ── Real-world projects (col-span-2) ── */}
          <FeatureCard accent={cardsMeta[0].accent} borderAccent={cardsMeta[0].borderAccent} glow={cardsMeta[0].glow} index={0} span="md:col-span-2" icon={cardsMeta[0].icon} title="Real-world projects" description="Work on actual production tasks from partner companies — bug fixes, features, and integrations.">
            <div className="mt-5 space-y-2">
              {quests.length > 0 ? (
                quests.slice(0, 4).map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2.5 transition-colors hover:border-slate-600/60 hover:bg-slate-800/60"
                  >
                    <RankBadge rank={q.difficulty} size="sm" />
                    <span className="truncate text-sm text-slate-300">{q.title}</span>
                    <span className="ml-auto shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                      Live
                    </span>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="rounded-lg border border-slate-700/40 bg-slate-800/40 px-4 py-5 text-center"
                >
                  <p className="text-sm text-slate-500">New quests dropping soon — join to be first in line.</p>
                </motion.div>
              )}
            </div>
          </FeatureCard>

          {/* ── Rank up (col-span-1) ── */}
          <FeatureCard accent={cardsMeta[1].accent} borderAccent={cardsMeta[1].borderAccent} glow={cardsMeta[1].glow} index={1} span="md:col-span-1" icon={cardsMeta[1].icon} title="Rank up from F to S" description="Progress through 7 ranks. Higher ranks unlock exclusive quests with bigger rewards.">
            <div className="mt-5 space-y-2.5">
              {ranks.map((r) => (
                <AnimatedRankBar key={r.rank} rank={r.rank} pct={r.pct} />
              ))}
            </div>
          </FeatureCard>

          {/* ── Get paid (col-span-1) ── */}
          <FeatureCard accent={cardsMeta[2].accent} borderAccent={cardsMeta[2].borderAccent} glow={cardsMeta[2].glow} index={2} span="md:col-span-1" icon={cardsMeta[2].icon} title="Get paid for your code" description="Every completed quest pays real money. Build your portfolio and your bank account simultaneously.">
            <div className="mt-5 space-y-2">
              {stats ? (
                <>
                  <StatRow icon={Layers} label="Open quests" value={String(stats.openQuests)} highlight />
                  <StatRow icon={Code2} label="Quests completed" value={String(stats.completedQuests)} />
                  <StatRow icon={Users} label="Active adventurers" value={String(stats.adventurers)} />
                  <StatRow icon={Briefcase} label="Partner companies" value={String(stats.companies)} />
                </>
              ) : (
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg border border-slate-700/40 bg-slate-800/40" />
                ))
              )}
            </div>
          </FeatureCard>

          {/* ── Code review (col-span-2) ── */}
          <FeatureCard accent={cardsMeta[3].accent} borderAccent={cardsMeta[3].borderAccent} glow={cardsMeta[3].glow} index={3} span="md:col-span-2" icon={cardsMeta[3].icon} title="Code review from senior engineers" description="Every submission gets reviewed. Get real feedback, learn best practices, and grow faster than any bootcamp.">
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-700/40 bg-slate-800/40 font-mono text-xs">
              {/* Diff header */}
              <div className="flex items-center gap-2 border-b border-slate-700/30 bg-slate-800/80 px-3 py-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[10px] text-slate-600">review — submit.tsx</span>
              </div>

              <div className="space-y-0.5 p-3">
                <DiffLine line="10" text="import { fetchData } from './api';" />
                <DiffLine line="11" text="import { useQuery } from '@tanstack/react-query';" />
                <DiffLineRemoved text="  const data = await fetch(url);" />
                <DiffLineAdded text="  const data = await fetchWithRetry(url, { retries: 3 });" />
                <DiffLine line="14" text={''} />
                <DiffLine line="15" text="  return (" />
                <DiffLine line="16" text={'    <div className="space-y-4">'} />
                <DiffLineRemoved text={'      <p>{data.map(...)}</p>'} />
                <DiffLineAdded text={'      <ErrorBoundary fallback={<ErrorUI />}>'} />
                <DiffLineAdded text={'        <ContributionList data={data} />'} />
                <DiffLineAdded text={'      </ErrorBoundary>'} />
                <DiffLine line="20" text={'    </div>'} />
                <DiffLine line="21" text="  );" />
              </div>

              {/* Review comment */}
              <div className="border-t border-slate-700/30 bg-slate-800/60 p-3 font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">
                    SR
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-purple-300">Senior Reviewer</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      Nice defensive approach. Add exponential backoff and
                      you&apos;re good to merge. Ship it.
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckIcon /> Approved
                      </span>
                      <span className="h-3 w-px bg-slate-700/40" />
                      <span>+120 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ─── Sub-components ─── */

function FeatureCard({
  index,
  span,
  icon: Icon,
  title,
  description,
  children,
  accent,
  borderAccent,
  glow,
}: {
  index: number;
  span: string;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  accent: string;
  borderAccent: string;
  glow: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group relative ${span} overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b ${accent} bg-slate-900 p-6 transition-all duration-300 ${borderAccent} hover:shadow-lg ${glow}`}
    >
      {/* Icon */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-400 group-hover:border-slate-600/50 group-hover:text-white">
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
      </div>

      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
      {children}

      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

function AnimatedRankBar({ rank, pct }: { rank: string; pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex items-center gap-2.5">
      <RankBadge rank={rank as Rank} size="sm" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/40">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={`h-full rounded-full ${rankBarColors[rank] ?? 'bg-slate-500'}`}
        />
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2.5 transition-colors hover:border-slate-600/50">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
        <p className="text-xs font-medium text-slate-300">{label}</p>
      </div>
      <span
        className={`text-sm font-semibold ${
          highlight ? 'text-indigo-400' : 'text-emerald-400'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DiffLine({ line, text }: { line: string; text: string }) {
  return (
    <div className="flex text-slate-400">
      <span className="mr-3 w-6 shrink-0 text-right text-slate-600">{line}</span>
      <span>{text}</span>
    </div>
  );
}

function DiffLineRemoved({ text }: { text: string }) {
  return (
    <div className="-mx-3 flex bg-red-500/10 px-3 text-red-400/80">
      <span className="mr-3 w-6 shrink-0 text-right text-red-600">−</span>
      <span>{text}</span>
    </div>
  );
}

function DiffLineAdded({ text }: { text: string }) {
  return (
    <div className="-mx-3 flex bg-emerald-500/10 px-3 text-emerald-400/80">
      <span className="mr-3 w-6 shrink-0 text-right text-emerald-600">+</span>
      <span>{text}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
