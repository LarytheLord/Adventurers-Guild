'use client';

import { motion } from 'framer-motion';
import {
  BookUser,
  FileSearch,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { GlowButton } from '@/components/ui/glow-button';

const steps = [
  {
    number: '01',
    icon: BookUser,
    title: 'Create your character',
    description:
      'Register as an Adventurer or Company, verify your profile, and unlock access to guild features, ranks, and public Guild Cards.',
    highlight: 'Profile + Verification',
  },
  {
    number: '02',
    icon: FileSearch,
    title: 'Browse and accept quests',
    description:
      'Explore live Quests by difficulty, stack, XP reward, payout, and required skills. Companies review applicants and select the best fit.',
    highlight: 'Find the right Quest',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Build and submit work',
    description:
      'Complete the Quest, collaborate with the Company, and submit production-ready work for review and approval.',
    highlight: 'QA + Review Process',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Earn rewards and rank up',
    description:
      'Get paid, receive reviews, unlock badges, and gain XP to progress from F-Rank all the way to S-Rank.',
    highlight: 'XP + Guild Progression',
  },
];

const stepIconColors = [
  'border-indigo-800/30 bg-indigo-500/10 text-indigo-400',
  'border-emerald-800/30 bg-emerald-500/10 text-emerald-400',
  'border-amber-800/30 bg-amber-500/10 text-amber-400',
  'border-purple-800/30 bg-purple-500/10 text-purple-400',
];

const highlightColors = [
  'border-indigo-800/30 bg-indigo-500/10 text-indigo-300',
  'border-emerald-800/30 bg-emerald-500/10 text-emerald-300',
  'border-amber-800/30 bg-amber-500/10 text-amber-300',
  'border-purple-800/30 bg-purple-500/10 text-purple-300',
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t border-slate-800/60 bg-slate-950 py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.08), transparent 35%), radial-gradient(circle at 80% 100%, rgba(249,115,22,0.05), transparent 40%)',
        }}
      />

      <div className="container relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400/70">
            How it works
          </p>

          <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-5xl">
            Your journey through the Guild
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Every Adventurer starts at F-Rank. Complete real-world Quests,
            build your reputation, earn rewards, and climb toward elite status.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute left-0 right-0 top-24 hidden h-px bg-gradient-to-r from-transparent via-indigo-800/30 to-transparent xl:block" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative h-full rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60 hover:shadow-[0_24px_60px_-30px_rgba(99,102,241,0.12)]">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Step {step.number}
                    </span>

                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${stepIconColors[index]}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${highlightColors[index]}`}>
                    {step.highlight}
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 xl:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 shadow-sm">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="mt-2 text-sm text-slate-500">Live Quests Across Multiple Categories</p>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-white">F → S</p>
            <p className="mt-2 text-sm text-slate-500">Rank Up Through Verified Project Work</p>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-white">24/7</p>
            <p className="mt-2 text-sm text-slate-500">New Quests, Teams, and Opportunities</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/register">
            <GlowButton size="lg">
              <Zap className="h-4 w-4" />
              Start Your First Quest
            </GlowButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
