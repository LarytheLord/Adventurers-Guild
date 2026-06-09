'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Briefcase, TrendingUp, Cpu, ArrowUpRight, Check } from 'lucide-react';

export default function WhyAG() {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Editorial header — left aligned, large type */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid items-end gap-6 md:grid-cols-[1fr_auto] md:gap-12"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Why Guild
            </p>
            <h2 className="mt-3 text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-slate-900 md:text-[56px]">
              Built for someone<br />
              starting with nothing.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 md:text-right">
            We removed every gatekeeper we could find. No degree check. No
            portfolio review. No bidding wars. Rank is the only signal that
            matters, and rank is earned.
          </p>
        </motion.div>

        {/* Asymmetric bento — 1 large + 3 small, NOT a uniform 4-column grid */}
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-slate-200 md:grid-cols-3 md:grid-rows-[260px_220px]">
          {/* Tile 1: large — the headline pitch */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-slate-950 p-8 md:col-span-2 md:row-span-2 md:p-10 flex flex-col justify-between"
          >
            <div>
              <BadgeCheck className="h-6 w-6 text-orange-400" />
              <h3 className="mt-6 text-2xl font-semibold leading-tight text-white md:text-3xl">
                Your rank is your resume.
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                F-Rank to S-Rank, earned from approved work. Companies see the
                proof — the rank, the XP, the deliverables — not a self-written
                bio. The signal is the same for everyone.
              </p>
            </div>
            <div className="mt-8 flex items-end gap-1">
              {(['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const).map((r, i) => (
                <div
                  key={r}
                  className={`flex h-7 items-center justify-center rounded-md text-[10px] font-bold ${
                    i === 0
                      ? 'w-8 bg-orange-500 text-slate-950'
                      : 'w-6 border border-slate-700 bg-slate-900 text-slate-500'
                  }`}
                >
                  {r}
                </div>
              ))}
              <span className="ml-3 text-xs text-slate-500">F to S · 7 ranks</span>
            </div>
          </motion.div>

          {/* Tile 2: real paid work */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white p-7"
          >
            <Briefcase className="h-5 w-5 text-slate-900" />
            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              Real paid work
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              No toy problems. The code you ship goes to a real product with
              real users. Real payout on approval.
            </p>
          </motion.div>

          {/* Tile 3: payouts scale */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-slate-50 p-7"
          >
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              Payouts scale with you
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Higher rank unlocks higher-paying quests. Earning ceiling is not
              set by your college degree.
            </p>
          </motion.div>
        </div>

        {/* BharatCode strip — editorial, not a 4th bento tile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-12 grid items-center gap-6 rounded-3xl border border-slate-200 bg-white p-8 md:grid-cols-[auto_1fr_auto] md:gap-10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
            <Cpu className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-500">
              Free infrastructure
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              BharatCode tools are bundled with every Adventurer account.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Desktop coding agent, shared model endpoint, and a compute
              sandbox — the same tools used to build the platform. Zero cost
              to start. No API keys, no subscriptions.
            </p>
          </div>
          <a
            href="https://bharatcode.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Learn more <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>

        {/* Comparison — one line each, not a 3-column checkmark table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-slate-200 md:grid-cols-3"
        >
          {[
            { vs: 'Upwork', point: 'Rank is set by approved work, not by how long you have been on the platform.' },
            { vs: 'Fiverr', point: 'RPG-style rank progression that means something, not seller levels anyone can buy past.' },
            { vs: 'LeetCode', point: 'Full project work with pay attached, not algorithms in isolation behind a paywall.' },
          ].map((row) => (
            <div key={row.vs} className="bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                vs {row.vs}
              </p>
              <div className="mt-4 flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <p className="text-sm leading-relaxed text-slate-700">{row.point}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
