'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BookUser,
  FileSearch,
  ShieldCheck,
  Trophy,
  Coins,
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

function AnimatedCount({ value, label }: { value: number; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === 0) return;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-[0_14px_30px_-24px_rgba(15,23,42,0.3)]">
      <p className="text-3xl font-bold text-orange-500 tabular-nums">
        {isInView ? count.toLocaleString() : '0'}
      </p>
      <p className="mt-2 text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function HowItWorks() {
  const [stats, setStats] = useState<{ adventurers: number; quests: number; completedQuests: number } | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data) =>
        setStats({
          adventurers: data.adventurers ?? 0,
          quests: data.openQuests ?? 0,
          completedQuests: data.completedQuests ?? 0,
        })
      )
      .catch(() => {});
  }, []);

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
          <div className="absolute left-0 right-0 top-24 hidden h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent xl:block" />

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
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-50 text-sm font-bold text-orange-600">
                      {step.number}
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white shadow-sm">
                      <svg className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <AnimatedCount value={stats?.quests ?? 0} label="Live Quests Across Multiple Categories" />
          <AnimatedCount value={stats?.adventurers ?? 0} label="Adventurers in the Guild" />
          <AnimatedCount value={stats?.completedQuests ?? 0} label="Quests Completed" />
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
