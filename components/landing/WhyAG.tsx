'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Bot, BriefcaseBusiness, Swords } from 'lucide-react';

const pillars = [
  {
    icon: BadgeCheck,
    title: 'Verified Credentials',
    description:
      'Your Guild Card shows rank, shipped quests, and quality signals that companies can actually verify.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Real Paid Work',
    description:
      'The board is built for production tasks, not toy exercises. Work has context, constraints, and consequences.',
  },
  {
    icon: Swords,
    title: 'RPG Progression',
    description:
      'Every completed quest compounds into XP, higher rank access, and clearer proof that you can deliver under pressure.',
  },
  {
    icon: Bot,
    title: 'AI-Augmented',
    description:
      'Use the tools that help you ship. The guild scores delivery capability, not how long you can avoid automation.',
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
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">Why AG</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Better than a profile marketplace, stronger than a coding challenge site.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Adventurers Guild combines live delivery, progression, and QA into one reputation loop companies can trust.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_22px_50px_-36px_rgba(15,23,42,0.85)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                <pillar.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-8 rounded-[28px] border border-slate-800 bg-slate-950/70 px-6 py-5"
        >
          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">Signal</p>
              <p className="mt-2">Guild Card over generic star ratings.</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">Work</p>
              <p className="mt-2">Production tasks instead of practice problems.</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">Growth</p>
              <p className="mt-2">Rank progression that compounds with every delivery.</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400/70">Review</p>
              <p className="mt-2">Open Paws QA mediates quality before work reaches clients.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
