'use client';

import { motion } from 'framer-motion';
import { BookUser, Coins, FileSearch, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '01',
    icon: BookUser,
    title: 'Create your character',
    description:
      'Register as an adventurer or company, then complete profile verification to unlock guild privileges.',
  },
  {
    number: '02',
    icon: FileSearch,
    title: 'Accept quests',
    description:
      'Browse live quests by rank, reward, and stack. Companies review applicants and assign the right talent.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Level up & earn',
    description:
      'Ship work, pass QA review, receive payout, and gain XP to climb from F-Rank to elite guild tiers.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.13),transparent_35%),radial-gradient(circle_at_80%_100%,rgba(14,165,233,0.08),transparent_40%)]" />
      <div className="container relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500/80">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-4xl">
            The Guild operating loop
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            A clear pipeline for both sides: transparent matching, quality gates, and trustworthy delivery.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-orange-200 via-orange-100 to-transparent lg:block" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{step.number}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50">
                    <step.icon className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-left text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-left text-sm leading-relaxed text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-300 px-6">
            <Link href="/register">
              <Coins className="h-4 w-4" />
              Start Your First Quest
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
