'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Sword, Trophy, Scroll, Shield, ArrowUpRight } from 'lucide-react';

const stats = [
  { value: 500, suffix: '+', label: 'Adventurers', Icon: Sword },
  { value: 50, prefix: '$', suffix: 'k+', label: 'Paid out', Icon: Trophy },
  { value: 120, suffix: '+', label: 'Quests completed', Icon: Scroll },
  { value: 15, label: 'Partner companies', Icon: Shield },
];

function Counter({
  value,
  label,
  prefix = '',
  suffix = '',
  Icon,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
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
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-white tabular-nums mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-y border-slate-800/70 bg-slate-950 py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-10 flex flex-col gap-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/70">
            Guild Registry
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Live activity across the guild
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-400">
            Real projects, real payouts, and measured growth for both adventurers and companies.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <Counter key={s.label} {...s} />
            ))}
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Metrics refresh daily
              <ArrowUpRight className="h-3.5 w-3.5 text-orange-400" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
