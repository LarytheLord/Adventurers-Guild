'use client';

import {
  UserCheck,
  Search,
  Send,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '01',
    icon: UserCheck,
    title: 'Create an account',
    description:
      'Register as an adventurer or company, set up your profile, and get verified to access the quest board.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse and claim quests',
    description:
      'Filter quests by stack, difficulty, and reward. Apply directly and wait for the company to pick you.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Build and submit',
    description:
      'Work on your own timeline. Submit production-ready code for the company to review.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Earn and rank up',
    description:
      'Get paid, receive your review, and gain XP. Climb from F-Rank to S-Rank as you complete more quests.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            From zero to shipped
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">{step.number}</span>
                <div className="h-px flex-1 bg-slate-100" />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                  <step.icon className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild className="h-11 rounded-xl px-7 text-sm">
            <Link href="/register">Create your account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
