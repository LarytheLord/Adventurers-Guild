'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import { useEffect, useState } from 'react';

const features = [
  'Browse live quests by rank, stack, and payout',
  'Claim work that matches your current rank',
  'Submit code, get reviewed, earn XP',
  'Your Guild Card shows what you can actually ship',
];

interface Quest {
  id: string;
  title: string;
  difficulty: string;
  xpReward: number;
  paymentAmount: number | null;
}

export default function ProductPreview() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const res = await fetch('/api/public/quests?limit=3');
        if (res.ok) {
          const data = await res.json();
          setQuests(data.quests || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹500';
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  return (
    <section className="bg-slate-50 py-20 md:py-32 border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-12">
          {/* Left: text — takes 5 cols, not 6/6 split */}
          <div className="md:col-span-5">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500"
            >
              The Quest Board
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.025em] text-slate-900 md:text-[44px]"
            >
              A board of real work,<br />
              filtered to your rank.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-sm leading-relaxed text-slate-600"
            >
              You only see quests you can claim. The board updates live as
              companies post new work and Adventurers accept assignments.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-8 space-y-3"
            >
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-slate-700">{f}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
              >
                See live quests
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>

          {/* Right: mock board — 7 cols, editorial framed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7"
          >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
              {/* Browser chrome */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="ml-2 flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    adventurersguild.com/quests
                  </div>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Live
                </span>
              </div>

              {/* Quest rows */}
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">Loading quests...</div>
                ) : quests.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">No quests available</div>
                ) : (
                  quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                    >
                      <RankBadge rank={(quest.difficulty as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S') || 'F'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {quest.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Available · {quest.xpReward} XP
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(quest.paymentAmount)}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {quest.xpReward} XP
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
                <span>Live quests</span>
                <Link href="/quests" className="font-medium text-slate-700 hover:text-slate-900">View all →</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
