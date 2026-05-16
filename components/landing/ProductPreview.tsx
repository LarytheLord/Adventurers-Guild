'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Shield, ScrollText, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  { icon: ScrollText, text: 'Browse real coding quests from companies' },
  { icon: Shield, text: 'Claim work that matches your rank' },
  { icon: Zap, text: 'Submit code, get reviewed, earn XP' },
  { icon: BadgeCheck, text: 'Your Guild Card proves what you can ship' },
];

export default function ProductPreview() {
  return (
    <section className="bg-slate-950 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/60"
            >
              Product Preview
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl"
            >
              See what the Guild looks like
            </motion.h2>
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-8 space-y-4"
            >
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                    <Check className="h-3.5 w-3.5 text-orange-400" />
                  </span>
                  <span className="text-sm text-slate-400">{f.text}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-8"
            >
              <Button asChild className="h-11 rounded-xl bg-orange-500 px-6 text-sm text-white hover:bg-orange-600">
                <Link href="/register">
                  Browse the Quest Board
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 md:order-2"
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-[10px] font-black text-black">
                    AG
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Quest Board</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { rank: 'D', title: 'Fix pagination on user dashboard', xp: 320, pay: '$80' },
                  { rank: 'C', title: 'Build API rate limiter middleware', xp: 550, pay: '$150' },
                  { rank: 'B', title: 'Design system migration — Button component', xp: 800, pay: '$250' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-[10px] font-bold text-white">
                          {item.rank}
                        </div>
                        <p className="text-sm font-medium text-slate-200">{item.title}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 pl-9">
                      <span className="text-xs text-orange-400">{item.xp} XP</span>
                      <span className="text-xs text-emerald-400">{item.pay}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
