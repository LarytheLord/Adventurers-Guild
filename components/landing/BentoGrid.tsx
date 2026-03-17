'use client';

import { motion } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';

const ranks = [
  { rank: 'S' as const, w: 'w-full' },
  { rank: 'A' as const, w: 'w-[85%]' },
  { rank: 'B' as const, w: 'w-[70%]' },
  { rank: 'C' as const, w: 'w-[55%]' },
  { rank: 'D' as const, w: 'w-[40%]' },
  { rank: 'E' as const, w: 'w-[25%]' },
  { rank: 'F' as const, w: 'w-[12%]' },
];

const rankBarColors: Record<string, string> = {
  S: 'bg-red-500',
  A: 'bg-orange-500',
  B: 'bg-amber-400',
  C: 'bg-violet-500',
  D: 'bg-blue-500',
  E: 'bg-emerald-500',
  F: 'bg-slate-500',
};

const features = [
  {
    title: 'Real-world projects',
    description:
      'No tutorials. Work on actual production tasks from partner companies - bug fixes, features, and integrations.',
    span: 'md:col-span-2',
    visual: (
      <div className="mt-6 space-y-2">
        {[
          { rank: 'D' as const, task: 'Fix pagination bug in dashboard' },
          { rank: 'C' as const, task: 'Build webhook handler for Stripe events' },
          { rank: 'B' as const, task: 'Add rate limiting to public API' },
        ].map(({ rank, task }) => (
          <div
            key={task}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
          >
            <RankBadge rank={rank} size="sm" />
            <span className="text-sm text-slate-300">{task}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Rank up from F to S',
    description: 'Progress through 7 ranks. Higher ranks unlock exclusive quests with bigger rewards.',
    span: 'md:col-span-1',
    visual: (
      <div className="mt-6 space-y-2">
        {ranks.map((r) => (
          <div key={r.rank} className="flex items-center gap-2.5">
            <RankBadge rank={r.rank} size="sm" />
            <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${rankBarColors[r.rank]} ${r.w}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Get paid for your code',
    description: 'Every completed quest pays real money. Build your portfolio and your bank account simultaneously.',
    span: 'md:col-span-1',
    visual: (
      <div className="mt-6 space-y-2">
        {[
          { label: 'API Bug Fix', amount: '$150', time: '2h ago' },
          { label: 'Dashboard Feature', amount: '$350', time: '1d ago' },
          { label: 'DB Migration', amount: '$600', time: '3d ago' },
        ].map((e) => (
          <div
            key={e.label}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50"
          >
            <div>
              <p className="text-xs text-slate-300 font-medium">{e.label}</p>
              <p className="text-[10px] text-slate-500">{e.time}</p>
            </div>
            <span className="text-sm font-semibold text-emerald-400">{e.amount}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Code review from senior engineers',
    description:
      'Every submission gets reviewed. Get real feedback, learn best practices, and grow faster than any bootcamp.',
    span: 'md:col-span-2',
    visual: (
      <div className="mt-6 rounded-lg bg-slate-800/80 border border-slate-700/50 p-4 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-slate-500">
            <span className="text-slate-600 mr-3">12</span>
            {'  const data = await'}
          </div>
          <div className="bg-red-500/10 text-red-400 rounded px-1.5 py-0.5 -mx-1.5">
            <span className="text-red-600 mr-3">{'-'}</span>
            {'    fetch(url);'}
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 rounded px-1.5 py-0.5 -mx-1.5">
            <span className="text-emerald-600 mr-3">{'+'}</span>
            {'    fetchWithRetry(url, 3);'}
          </div>
          <div className="text-slate-500">
            <span className="text-slate-600 mr-3">14</span>
            {'  return data.json();'}
          </div>
        </div>
        <div className="mt-3 p-2.5 bg-slate-700/40 border border-slate-600/40 rounded-lg font-sans">
          <p className="text-xs text-slate-300">
            <span className="font-semibold text-orange-400">@senior_dev</span>{' '}
            <span className="text-slate-400">
              Nice catch - consider adding exponential backoff for production.
            </span>
          </p>
        </div>
      </div>
    ),
  },
];

export default function BentoGrid() {
  return (
    <section className="py-20 md:py-28 bg-slate-950">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-400/60 uppercase mb-3">
            Why the Guild
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-white">
            Not your average coding platform
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`${feature.span} bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors duration-200`}
            >
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{feature.description}</p>
              {feature.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
