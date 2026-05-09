'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="bg-slate-950 py-24 md:py-32">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to start?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Join the Guild, claim your first quest, and start building your rank today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                For developers
              </p>
              <h3 className="mt-2 text-base font-semibold text-white">
                Join as an adventurer
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                Browse quests, submit production code, and earn your way to S-Rank.
              </p>
            </div>
            <Button asChild className="mt-6 h-11 rounded-xl text-sm">
              <Link href="/register">
                Create adventurer account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                For companies
              </p>
              <h3 className="mt-2 text-base font-semibold text-white">
                Post your first quest
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                Describe your project, set the reward, and let adventurers compete for the work.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6 h-11 rounded-xl border-slate-700 text-sm text-slate-200 hover:bg-slate-800"
            >
              <Link href="/register-company">
                Create company account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
