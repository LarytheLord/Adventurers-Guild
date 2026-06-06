'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Briefcase, TrendingUp, Cpu } from 'lucide-react';

const columns = [
  {
    icon: BadgeCheck,
    title: 'Verified Credentials',
    description:
      'Your Guild Card shows rank, quests, and quality scores — all verifiable by employers.',
  },
  {
    icon: Briefcase,
    title: 'Real Paid Work',
    description:
      'Not toy problems. Real client tasks that ship to production.',
  },
  {
    icon: TrendingUp,
    title: 'RPG Progression',
    description:
      'F-Rank to S-Rank. Every quest completion levels you up.',
  },
  {
    icon: Cpu,
    title: 'BharatCode-Powered',
    description:
      'Built on BharatCode\'s free AI coding infrastructure — desktop agent, model endpoint, shared compute. Zero cost for students.',
  },
];

export default function WhyAG() {
  return (
    <section className="bg-slate-900 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/60">
            Why Adventurers Guild
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Built different
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 hover:border-slate-600/50 transition-colors duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                <col.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{col.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{col.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30"
        >
          <div className="grid grid-cols-1 divide-y divide-slate-700/50 md:grid-cols-3 md:divide-x md:divide-y-0">
            <ComparisonRow
              label="vs Upwork"
              items={[
                { ours: 'Skill-verified matching', theirs: 'Race-to-bottom bidding' },
                { ours: 'Code-reviewed submissions', theirs: 'Unchecked deliverables' },
              ]}
            />
            <ComparisonRow
              label="vs Fiverr"
              items={[
                { ours: 'RPG rank progression', theirs: 'Static seller levels' },
                { ours: 'Real dev tasks', theirs: 'Generic gigs' },
              ]}
            />
            <ComparisonRow
              label="vs LeetCode"
              items={[
                { ours: 'Full project work', theirs: 'Isolated algorithms' },
                { ours: 'Paid real outcomes', theirs: 'Subscription for practice' },
              ]}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonRow({
  label,
  items,
}: {
  label: string;
  items: { ours: string; theirs: string }[];
}) {
  return (
    <div className="p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.ours} className="grid grid-cols-2 gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              {item.ours}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              {item.theirs}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
