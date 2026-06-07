'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * How it works — single column with large editorial numbers.
 * Inspired by Linear/Stripe. Breaks the 4-column-grid AI pattern.
 */
const steps = [
  {
    number: '01',
    title: 'Make an account',
    description:
      'Sign up in under a minute. No resume, no interview, no portfolio review. You start at F-Rank with access to beginner quests the same day.',
    time: '~1 minute',
  },
  {
    number: '02',
    title: 'Pick a quest',
    description:
      'Browse open quests filtered by your rank, tech stack, and payout. Each quest shows the pay upfront and the deadline — no hidden terms.',
    time: '~5 minutes',
  },
  {
    number: '03',
    title: 'Ship the work',
    description:
      'Build it, submit it, and the company reviews. You get feedback either way, and good feedback compounds into a portfolio that actually proves what you can do.',
    time: 'Days to weeks',
  },
  {
    number: '04',
    title: 'Get paid, rank up',
    description:
      'Approved work pays out and you earn XP. Hit the threshold for the next rank, and bigger quests unlock automatically. Payouts scale with rank.',
    time: 'Instant payout',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-orange-400/80">
            How it works
          </p>
          <h2 className="mt-5 text-balance text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[48px] md:text-[56px]">
            Four steps.<br />No gatekeepers.
          </h2>
        </div>

        {/* Single column with large numbers — not a 4-col grid */}
        <div className="mt-20 grid gap-0 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {steps.map((step, index) => (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="grid grid-cols-[80px_1fr] gap-6 py-8 md:gap-8 md:py-10"
                >
                  <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums text-orange-400 md:text-[56px]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-white md:text-[22px]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.65] text-white/55 md:text-[15px]">
                      {step.description}
                    </p>
                    <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.1em] text-white/30">
                      {step.time}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Sidebar — what you get when you finish */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="sticky top-12 rounded-xl border border-white/10 bg-white/[0.02] p-8">
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-orange-400/80">
                What you walk away with
              </p>
              <h3 className="mt-5 text-balance text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                A portfolio that proves what you can ship.
              </h3>
              <p className="mt-4 text-[14px] leading-[1.6] text-white/55">
                Every approved quest adds to your Guild Card — rank, XP, work
                samples, and company feedback. The card is yours forever,
                verifiable by anyone, and it travels with you.
              </p>
              <Link
                href="/register"
                className="mt-7 inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                Start at F-Rank
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
