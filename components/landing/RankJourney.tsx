'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { Target, Zap, Swords, ShieldCheck, Star, Sparkles, Trophy } from 'lucide-react';

const RANKS_DATA: { rank: Rank; label: string; xpNeeded: number; exampleQuests: string[]; icon: typeof Target }[] = [
  { rank: 'F', label: 'Apprentice', xpNeeded: 0, exampleQuests: ['Tutorial quests', 'Simple bug fixes'], icon: Target },
  { rank: 'E', xpNeeded: 1_000, label: 'Novice', exampleQuests: ['Small feature additions', 'Documentation tasks'], icon: Zap },
  { rank: 'D', xpNeeded: 3_000, label: 'Warrior', exampleQuests: ['API endpoint development', 'Component building'], icon: Swords },
  { rank: 'C', xpNeeded: 7_500, label: 'Knight', exampleQuests: ['System integrations', 'Team leadership tasks'], icon: ShieldCheck },
  { rank: 'B', xpNeeded: 15_000, label: 'Veteran', exampleQuests: ['High-stakes commissions', 'Architecture decisions'], icon: Star },
  { rank: 'A', xpNeeded: 30_000, label: 'Master', exampleQuests: ['Mentoring programs', 'Enterprise clients'], icon: Sparkles },
  { rank: 'S', xpNeeded: 60_000, label: 'Legend', exampleQuests: ['Guild elite work', 'Platform direction'], icon: Trophy },
];

export default function RankJourney() {
  const [expandedRank, setExpandedRank] = useState<Rank | null>(null);

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-500 uppercase mb-3">
            The Progression
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900">
            Your journey to S-Rank
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            From your first bug fix to leading mission-critical systems. Every quest brings you closer to the elite tiers of the guild.
          </p>
        </motion.div>

        <div className="relative">
          {/* Orange gradient connecting line */}
          <div className="absolute top-16 left-0 w-full h-0.5 bg-gradient-to-r from-slate-200 via-orange-300 to-slate-200 hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 relative z-10">
            {RANKS_DATA.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedRank === item.rank;
              return (
                <motion.div
                  key={item.rank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col items-center text-center cursor-pointer"
                  onClick={() => setExpandedRank(isExpanded ? null : item.rank)}
                >
                  <div className="mb-3 relative">
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <RankBadge rank={item.rank} size="lg" glow />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{item.label}</p>
                  <p className="text-[10px] uppercase tracking-wider text-orange-500 font-semibold">{item.rank}-Rank</p>
                  {item.xpNeeded > 0 && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.xpNeeded.toLocaleString()} XP</p>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 w-full bg-slate-50 rounded-xl border border-slate-100 p-3 text-left overflow-hidden"
                      >
                        <div className="flex items-center gap-1.5 text-orange-500 mb-1.5">
                          <Icon size={12} />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Unlocks</span>
                        </div>
                        <ul className="space-y-1">
                          {item.exampleQuests.map((quest, i) => (
                            <li key={i} className="text-[10px] text-slate-600 leading-tight">
                              · {quest}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">Click a rank to see what unlocks</p>
      </div>
    </section>
  );
}
