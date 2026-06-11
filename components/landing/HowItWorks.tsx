'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, UserPlus, Search, Rocket, TrendingUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Make an account',
    description:
      'Sign up in under a minute. No resume, no interview, no portfolio review. You start at F-Rank with access to beginner quests the same day.',
    time: '~1 minute',
  },
  {
    number: '02',
    icon: Search,
    title: 'Pick a quest',
    description:
      'Browse open quests filtered by your rank, tech stack, and payout. Each quest shows the pay upfront and the deadline — no hidden terms.',
    time: '~5 minutes',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Ship the work',
    description:
      'Build it, submit it, and the company reviews. You get feedback either way, and good feedback compounds into a portfolio that actually proves what you can do.',
    time: 'Days to weeks',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Get paid, rank up',
    description:
      'Approved work pays out and you earn XP. Hit the threshold for the next rank, and bigger quests unlock automatically. Payouts scale with rank.',
    time: 'Instant payout',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative grid grid-cols-[56px_1fr] gap-6 md:gap-8"
    >
      {/* Timeline connector */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all group-hover:border-orange-200 group-hover:shadow-md group-hover:shadow-orange-500/5"
        >
          <step.icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-orange-500" strokeWidth={1.8} />
        </motion.div>
        {index < steps.length - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
            className="absolute top-14 h-full w-px origin-top bg-gradient-to-b from-slate-200 to-transparent"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 md:pb-14">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500">
            Step {step.number}
          </span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400">
            {step.time}
          </span>
        </div>
        <h3 className="mt-2 text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-slate-900 md:text-[22px]">
          {step.title}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.7] text-slate-500 md:text-[15px]">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-10%' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="how-it-works" ref={containerRef} className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Decorative background */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute -right-32 top-24 h-[500px] w-[500px] rounded-full bg-orange-50/60 blur-3xl"
      />
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute -left-32 bottom-24 h-[400px] w-[400px] rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-6 pt-20 lg:pt-0">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
            How it works
          </p>
          <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900 sm:text-[44px] md:text-[48px]">
            Four steps.<br />No gatekeepers.
          </h2>
        </motion.div>

        {/* Steps + Sidebar */}
        <div className="mt-20 grid gap-0 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500">
                What you walk away with
              </p>
              <h3 className="mt-4 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-slate-900">
                A portfolio that proves what you can ship.
              </h3>
              <p className="mt-4 text-[14px] leading-[1.65] text-slate-500">
                Every approved quest adds to your Guild Card — rank, XP, work
                samples, and company feedback. The card is yours forever,
                verifiable by anyone, and it travels with you.
              </p>
              <Link
                href="/register"
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[13px] font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/10"
              >
                Start at F-Rank
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
              <a
                href="https://chat.whatsapp.com/FFR8bOzvsJr3xHDnhGpB95"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-700 transition-all hover:border-green-300 hover:text-green-700 hover:shadow-sm"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                Join our WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
