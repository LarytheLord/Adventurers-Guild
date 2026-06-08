'use client';

import Link from 'next/link';
import { ArrowRight, Building2, UserPlus } from 'lucide-react';

/**
 * CTA — inspired by Linear/Vercel/Stripe.
 * No bullet lists. No icon+title+description+list+button pattern.
 * Single headline, two clear actions with proper hierarchy.
 */
export default function CTASection() {
  return (
    <section id="join" className="bg-slate-950 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Editorial header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-orange-400/80">
            Start now
          </p>
          <h2 className="mt-5 text-balance text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[48px] md:text-[56px]">
            Your first paid quest<br />
            is one click away.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-balance text-[15px] leading-[1.6] text-white/55">
            Free to join. Free BharatCode tools. Pay only on approved work.
          </p>
        </div>

        {/* Two paths — clear hierarchy, no bullet lists */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
          <div className="bg-slate-950 p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10 border border-orange-500/20">
                <UserPlus className="h-4 w-4 text-orange-400" strokeWidth={2.2} />
              </div>
              <p className="text-[13px] font-medium text-white">
                For Adventurers
              </p>
            </div>
            <p className="mt-5 text-balance text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-white">
              Start at F-Rank, climb to S-Rank.
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/55">
              No portfolio. No degree check. Pick a quest, ship the work, get paid.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              Create Adventurer account
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="bg-slate-950 p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 border border-white/10">
                <Building2 className="h-4 w-4 text-white/60" strokeWidth={2.2} />
              </div>
              <p className="text-[13px] font-medium text-white">
                For Companies
              </p>
            </div>
            <p className="mt-5 text-balance text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-white">
              Hire by rank, not by resume.
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/55">
              Post a quest. Get matched. Pay only when delivery meets your bar.
            </p>
            <Link
              href="/register?tab=company"
              className="mt-8 inline-flex h-10 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 hover:border-white/25"
            >
              Create Company account
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Footnote — small, restrained */}
        <p className="mt-10 text-center text-[12px] text-white/35">
          Open source under MIT · Backed by Open Paws · Built on BharatCode
        </p>
      </div>
    </section>
  );
}
