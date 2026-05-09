'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

type PublicStats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

const features = [
  {
    title: 'Real production work',
    description:
      'No tutorials or toy projects. Every quest ships to real companies with real users.',
    items: [
      'Live bug fixes and feature development',
      'Direct collaboration with company engineers',
      'Production code reviewed by senior devs',
    ],
  },
  {
    title: 'Built-in code review',
    description:
      'Every submission gets reviewed. Get actionable feedback that grows your skills faster than any course.',
    items: [
      'Line-by-line review from experienced engineers',
      'Learn best practices and production patterns',
      'Track improvement over multiple quests',
    ],
  },
  {
    title: 'Progression that compounds',
    description:
      'Complete quests, earn XP, and unlock higher ranks. Your rank is a verifiable signal of real skill.',
    items: [
      '7 ranks from F to S',
      'Higher ranks unlock better quests',
      'Your rank is public on your profile',
    ],
  },
  {
    title: 'Get paid for quality',
    description:
      'Companies pay when delivery meets their bar. No free work, no spec changes after the fact.',
    items: [
      'Clear scope before you start',
      'Payment on approval, not submission',
      'Fair dispute resolution through QA',
    ],
  },
];

export default function BentoGrid() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Why the Guild
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Built for real developers
          </h2>
          {stats && (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
              {stats.completedQuests.toLocaleString()} quests completed &middot;{' '}
              {stats.adventurers.toLocaleString()} adventurers &middot;{' '}
              {stats.companies.toLocaleString()} partner companies
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild className="h-11 rounded-xl px-7 text-sm">
            <Link href="/register">Start building your rank</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{feature.description}</p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {feature.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
