'use client';

import { motion } from 'framer-motion';
import {
  BookUser,
  Coins,
  FileSearch,
  ShieldCheck,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.13),transparent_35%),radial-gradient(circle_at_80%_100%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="container relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500/80">
            How it works
          </p>

          <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-5xl">
            Your journey through the Guild
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Every Adventurer starts at F-Rank. Complete real-world Quests,
            build your reputation, earn rewards, and climb toward elite status.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute left-0 right-0 top-24 hidden h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent xl:block" />

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
                <div className="relative h-full rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_60px_-30px_rgba(249,115,22,0.25)]">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Step {step.number}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50">
                      <step.icon className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>

                  <div className="mb-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700">
                    {step.highlight}
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 xl:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-[0_14px_30px_-24px_rgba(15,23,42,0.3)]">
            <p className="text-3xl font-bold text-slate-900">500+</p>
            <p className="mt-2 text-sm text-slate-600">Live Quests Across Multiple Categories</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-[0_14px_30px_-24px_rgba(15,23,42,0.3)]">
            <p className="text-3xl font-bold text-slate-900">F → S</p>
            <p className="mt-2 text-sm text-slate-600">Rank Up Through Verified Project Work</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-[0_14px_30px_-24px_rgba(15,23,42,0.3)]">
            <p className="text-3xl font-bold text-slate-900">24/7</p>
            <p className="mt-2 text-sm text-slate-600">New Quests, Teams, and Opportunities</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild className="h-12 rounded-xl bg-orange-500 px-7 text-white hover:bg-orange-600">
            <Link href="/register">
              <Coins className="mr-2 h-4 w-4" />
              Start Your First Quest
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

