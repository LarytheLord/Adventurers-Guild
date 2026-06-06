'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Users, ArrowRight, SearchX } from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

type PublicQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
};

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function formatPay(n: number | null): string {
  if (n == null) return 'Unpaid';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function QuestShowcase() {
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/quests')
      .then((r) => r.json())
      .then((data) => setQuests(data.quests ?? []))
      .catch(() => setQuests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="quests" className="bg-white py-20 md:py-28 border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-500">
              Live Quests
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-4xl">
              Real work, posted right now.
            </h2>
          </div>
          <p className="text-sm text-slate-500 md:max-w-xs md:text-right">
            Pulled live from the Guild. Click any quest to see the full brief.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-slate-200 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-slate-50 p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center"
          >
            <SearchX className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-4 text-sm font-medium text-slate-700">
              No open quests right now.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              New quests are posted every week. Join the waitlist and we will
              email you when one matches your rank.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Join the waitlist
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-slate-200 md:grid-cols-3">
              {quests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="bg-white p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <RankBadge rank={quest.difficulty} size="sm" />
                    {quest.monetaryReward != null ? (
                      <p className="text-[20px] font-bold leading-none text-slate-900 tabular-nums">
                        {formatPay(quest.monetaryReward)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Unpaid</p>
                    )}
                  </div>

                  <h3 className="mt-5 text-base font-semibold leading-snug text-slate-900">
                    {quest.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{quest.company}</p>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-2 flex-1">
                    {quest.description}
                  </p>

                  {quest.requiredSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {quest.requiredSkills.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-orange-500" />
                      {quest.xpReward.toLocaleString()} XP
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatDeadline(quest.deadline)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {quest.applicants}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 flex justify-center"
            >
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
              >
                View all quests
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
