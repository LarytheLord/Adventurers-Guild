'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Sword, Trophy, Scroll, Shield } from 'lucide-react';

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
    <section className="py-16 md:py-20 bg-slate-950 border-y border-slate-800/60">
      <div className="container px-6 mx-auto max-w-4xl">
        <p className="text-center text-[11px] font-semibold tracking-[0.15em] text-orange-400/60 uppercase mb-10">
          Guild Registry
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <Counter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
