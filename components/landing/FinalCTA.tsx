'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlowButton } from '@/components/ui/glow-button';

function Counter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        {count.toLocaleString()}+
      </p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

const stats = [
  { target: 500, label: 'Quests completed' },
  { target: 200, label: 'Active developers' },
  { target: 50, label: 'Partner companies' },
  { target: 94, label: '% Satisfaction rate' },
];

const features = [
  'No equity required — you keep 100% of what you earn',
  'Real production tasks from actual companies',
  'Hand-reviewed submissions with detailed feedback',
  'Rank-based progression from F to S-Rank',
  'Built-in portfolio of completed work',
];

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-slate-800/60 bg-slate-950 py-24 md:py-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 30% 0%, rgba(99,102,241,0.08), transparent), radial-gradient(ellipse 60% 35% at 70% 100%, rgba(249,115,22,0.05), transparent)',
        }}
      />

      {/* Vercel-style dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative container mx-auto max-w-6xl px-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((s) => (
            <Counter key={s.label} target={s.target} label={s.label} />
          ))}
        </motion.div>

        {/* Main CTA */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-800/30 bg-indigo-950/30 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Now accepting adventurers
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Ship code.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Level up.
            </span>{' '}
            Get paid.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400"
          >
            Join a growing community of developers earning real income through quest-based work.
            No applications, no interviews — just code that ships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/register">
              <GlowButton size="lg">
                Create Free Account <Zap className="h-4 w-4" />
              </GlowButton>
            </Link>
            <Link href="/quests">
              <GlowButton variant="secondary" size="lg">
                Browse Quests <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </Link>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 grid gap-2 text-left sm:grid-cols-2 sm:gap-x-8"
          >
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-xs text-slate-400">{f}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
