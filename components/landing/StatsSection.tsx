'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

type StatItem = {
  value: number;
  label: string;
};

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats([
          { value: data.adventurers ?? 0, label: 'Adventurers' },
          { value: data.companies ?? 0, label: 'Partner companies' },
          { value: data.completedQuests ?? 0, label: 'Quests completed' },
          { value: data.openQuests ?? 0, label: 'Open quests' },
        ]);
      })
      .catch(() => {
        setStats([
          { value: 0, label: 'Adventurers' },
          { value: 0, label: 'Partner companies' },
          { value: 0, label: 'Quests completed' },
          { value: 0, label: 'Open quests' },
        ]);
      });
  }, []);

  return (
    <section className="border-y border-slate-200 bg-white py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-px rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-4">
          {stats.map((s, i) => (
            <StatCell key={s.label} value={s.value} label={s.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCell({ value, label, index }: { value: number; label: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
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
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center bg-white px-4 py-8 text-center ${
        index < 2 ? 'md:border-b-0' : ''
      } ${index % 2 === 1 ? 'md:border-l-0' : ''}`}
    >
      <div className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl tabular-nums">
        {count.toLocaleString()}
      </div>
      <div className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}
