'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <section className="py-20 md:py-28 bg-slate-950">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-400/60 uppercase mb-3">
              Open quests
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-white">
              Ready to be claimed
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg w-fit bg-transparent"
          >
            <Link href="/register" className="flex items-center gap-2 text-sm">
              View all quests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-5 animate-pulse h-64" />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400 text-sm">No open quests right now — check back soon.</p>
            <Button asChild variant="outline" className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent">
              <Link href="/register">Join the waitlist</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-600 transition-colors duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <RankBadge rank={quest.difficulty} size="sm" />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-white mb-1 leading-snug">{quest.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{quest.company}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{quest.description}</p>

                {/* Tags */}
                {quest.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {quest.requiredSkills.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-800 mb-4" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Stat icon={<Zap className="w-3.5 h-3.5 text-orange-400" />} value={`${quest.xpReward.toLocaleString()} XP`} />
                  {quest.monetaryReward != null ? (
                    <Stat icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />} value={`$${quest.monetaryReward}`} />
                  ) : (
                    <Stat icon={<DollarSign className="w-3.5 h-3.5 text-slate-600" />} value="Unpaid" />
                  )}
                  <Stat icon={<Clock className="w-3.5 h-3.5 text-slate-500" />} value={formatDeadline(quest.deadline)} />
                  <Stat icon={<Users className="w-3.5 h-3.5 text-slate-500" />} value={`${quest.applicants} applied`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      {icon}
      <span>{value}</span>
    </div>
  );
}
