'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Sword, Scroll, Shield, ArrowUpRight, Target } from 'lucide-react';

type StatItem = {
  value: number;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function Counter({
  value,
  label,
  Icon,
}: StatItem) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === 0) return;
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
        {count.toLocaleString()}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats([
          { value: data.adventurers ?? 0, label: 'Adventurers', Icon: Sword },
          { value: data.companies ?? 0, label: 'Partner companies', Icon: Shield },
          { value: data.completedQuests ?? 0, label: 'Quests completed', Icon: Scroll },
          { value: data.openQuests ?? 0, label: 'Open quests', Icon: Target },
        ]);
      })
      .catch(() => {
        // Silently fail — show zeros
        setStats([
          { value: 0, label: 'Adventurers', Icon: Sword },
          { value: 0, label: 'Partner companies', Icon: Shield },
          { value: 0, label: 'Quests completed', Icon: Scroll },
          { value: 0, label: 'Open quests', Icon: Target },
        ]);
      });
  }, []);

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
              Live data from the guild
              <ArrowUpRight className="h-3.5 w-3.5 text-orange-400" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
