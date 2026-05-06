'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const bullets = [
  'Browse real coding quests from companies',
  'Claim work that matches your rank',
  'Submit code, get reviewed, earn XP',
  'Your Guild Card proves what you can ship',
];

export default function ProductPreview() {
  return (
    <section className="py-20 md:py-28 bg-slate-950">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-500 uppercase mb-3">
            See it in action
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-white">
            The quest board
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Quest board mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-4 flex-1 h-6 bg-slate-900 rounded text-[10px] text-slate-500 flex items-center px-3">
                  adventurersguild.com/quests
                </div>
              </div>

              {/* Quest board content */}
              <div className="p-6 space-y-4">
                {/* Search bar */}
                <div className="h-10 bg-slate-800 rounded-lg border border-slate-700" />

                {/* Quest cards */}
                {[
                  { title: 'Build a REST API for inventory', rank: 'C', xp: '1,200 XP', pay: '$400' },
                  { title: 'Fix auth token refresh bug', rank: 'D', xp: '600 XP', pay: '$150' },
                  { title: 'Design landing page component', rank: 'E', xp: '300 XP', pay: '$80' },
                ].map((quest, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                        {quest.rank}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{quest.title}</div>
                        <div className="text-xs text-slate-500">{quest.xp} · {quest.pay}</div>
                      </div>
                    </div>
                    <div className="text-xs text-orange-400 font-medium">Claim</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl pointer-events-none" />
          </motion.div>

          {/* Right: Bullet points + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ul className="space-y-6">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <span className="text-base text-slate-300 leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button asChild className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                <Link href="/register">
                  Browse the Quest Board
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
