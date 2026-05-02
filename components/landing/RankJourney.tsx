'use client';
import { motion } from 'framer-motion';
import { RankBadge } from '@/components/ui/rank-badge';
import { Sparkles, Trophy, Zap, ShieldCheck, Target, Star, Swords } from 'lucide-react';

const RANKS_DATA = [
  { rank: 'F', label: 'Apprentice', perk: 'Entry-level quests', icon: Target },
  { rank: 'E', label: 'Novice', perk: 'Pair programming unlocked', icon: Zap },
  { rank: 'D', label: 'Warrior', perk: 'Professional intern track', icon: Swords },
  { rank: 'C', label: 'Knight', perk: 'Squad leadership potential', icon: ShieldCheck },
  { rank: 'B', label: 'Veteran', perk: 'High-stakes commissions', icon: Star },
  { rank: 'A', label: 'Master', perk: 'Mentorship eligibility', icon: Sparkles },
  { rank: 'S', label: 'Legend', perk: 'Guild elite privileges', icon: Trophy },
];

export default function RankJourney() {
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
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 relative z-10">
            {RANKS_DATA.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.rank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <RankBadge rank={item.rank as any} size="lg" glow className="relative z-10" />
                  </div>
                  <div className="bg-white lg:bg-transparent p-4 lg:p-0 rounded-xl border border-slate-100 lg:border-0">
                    <h3 className="font-bold text-slate-900">{item.label}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-orange-500 font-semibold mt-1">{item.rank}-Rank</p>
                    <div className="mt-3 flex justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                      <Icon size={16} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed px-2">{item.perk}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
