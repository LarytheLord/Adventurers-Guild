import { motion } from 'framer-motion';
import { Zap, Clock, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

export type PublicQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: Rank;
  questCategory?: string;
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

export function PublicQuestCard({ quest, index }: { quest: PublicQuest; index: number }) {
  return (
    <Link href={`/quests/${quest.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-600 transition-colors duration-200 h-full"
      >
        <div className="flex items-center justify-between mb-4">
          <RankBadge rank={quest.difficulty} size="sm" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1 leading-snug line-clamp-2">{quest.title}</h3>
        <p className="text-xs text-slate-500 mb-3">{quest.company}</p>
        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{quest.description}</p>

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

        <div className="h-px bg-slate-800 mb-4" />

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>{quest.xpReward.toLocaleString()} XP</span>
          </div>
          {quest.monetaryReward != null ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>${quest.monetaryReward}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign className="w-3.5 h-3.5 text-slate-600" />
              <span>Unpaid</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDeadline(quest.deadline)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{quest.applicants} applied</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
