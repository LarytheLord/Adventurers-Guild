'use client';

import { Badge } from '@/components/ui/badge';
import { RankBadge } from '@/components/ui/rank-badge';
import {
  GuildCard,
  GuildPage,
  GuildPanel,
} from '@/components/guild/primitives';
import {
  Calendar,
  ExternalLink,
  Flame,
  Github,
  Linkedin,
  MapPin,
  Sparkles,
  Star,
  Swords,
  Target,
  Zap,
} from 'lucide-react';

interface QuestHistoryItem {
  title: string;
  difficulty: string;
  category: string;
  track: string;
  xpEarned: number;
  qualityScore: number | null;
  completedAt: string;
}

interface Adventurer {
  id: string;
  name: string | null;
  username: string | null;
  rank: string;
  xp: number;
  skillPoints: number;
  level: number;
  bio: string | null;
  location: string | null;
  github: string | null;
  linkedin: string | null;
  avatar: string | null;
  joinedAt: string;
  profile: {
    skills: string[];
    specialization: string | null;
    totalQuestsCompleted: number;
    completionRate: number;
    currentStreak: number;
    maxStreak: number;
    availability: string;
  } | null;
  questHistory: QuestHistoryItem[];
  stats: {
    totalXpEarned: number;
    averageQuality: number | null;
    questCount: number;
  };
}

const RANK_THRESHOLDS: Record<string, { next: string; xpNeeded: number }> = {
  F: { next: 'E', xpNeeded: 1000 },
  E: { next: 'D', xpNeeded: 3000 },
  D: { next: 'C', xpNeeded: 6000 },
  C: { next: 'B', xpNeeded: 10000 },
  B: { next: 'A', xpNeeded: 15000 },
  A: { next: 'S', xpNeeded: 25000 },
  S: { next: 'S', xpNeeded: 99999 },
};

function difficultyColor(d: string) {
  const map: Record<string, string> = {
    F: 'bg-slate-100 text-slate-600 border-slate-200',
    E: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    D: 'bg-blue-50 text-blue-700 border-blue-200',
    C: 'bg-purple-50 text-purple-700 border-purple-200',
    B: 'bg-amber-50 text-amber-700 border-amber-200',
    A: 'bg-red-50 text-red-700 border-red-200',
    S: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return map[d] || 'bg-slate-100 text-slate-600 border-slate-200';
}

export function GuildCardProfile({ adventurer }: { adventurer: Adventurer }) {
  const a = adventurer;
  const threshold = RANK_THRESHOLDS[a.rank] || RANK_THRESHOLDS.F;
  const prevThreshold = Object.values(RANK_THRESHOLDS).find((t) => t.next === a.rank);
  const prevXp = prevThreshold?.xpNeeded || 0;
  const progress = a.rank === 'S' ? 100 : Math.min(100, Math.round(((a.xp - prevXp) / (threshold.xpNeeded - prevXp)) * 100));

  return (
    <GuildPage>
      {/* Hero section */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white sm:p-12">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Avatar / Rank */}
          <div className="flex-shrink-0">
            {a.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.avatar}
                alt={a.name || 'Adventurer'}
                className="h-24 w-24 rounded-2xl border-2 border-orange-500/30 object-cover"
              />
            ) : (
              <RankBadge rank={a.rank as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="xl" glow />
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold sm:text-3xl">{a.name || 'Adventurer'}</h1>
              <RankBadge rank={a.rank as 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'} size="md" glow />
            </div>
            {a.username && (
              <p className="mt-1 text-sm text-slate-400">@{a.username}</p>
            )}
            {a.bio && (
              <p className="mt-2 max-w-xl text-sm text-slate-300">{a.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {a.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {a.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined {new Date(a.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              {a.github && (
                <a href={`https://github.com/${a.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                  <Github className="h-3 w-3" /> {a.github}
                </a>
              )}
              {a.linkedin && (
                <a href={a.linkedin.startsWith('http') ? a.linkedin : `https://linkedin.com/in/${a.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{a.rank}-Rank</span>
            {a.rank !== 'S' && <span>{threshold.next}-Rank at {threshold.xpNeeded.toLocaleString()} XP</span>}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{a.xp.toLocaleString()} XP total</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Quests Completed', value: String(a.profile?.totalQuestsCompleted ?? 0), Icon: Swords, accent: 'text-orange-500' },
          { label: 'Total XP', value: a.xp.toLocaleString(), Icon: Zap, accent: 'text-amber-500' },
          { label: 'Avg Quality', value: a.stats.averageQuality ? `${a.stats.averageQuality}/10` : 'N/A', Icon: Star, accent: 'text-sky-500' },
          { label: 'Best Streak', value: `${a.profile?.maxStreak ?? 0} days`, Icon: Flame, accent: 'text-rose-500' },
        ].map(({ label, value, Icon, accent }) => (
          <GuildCard key={label} className="border-slate-200/80">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${accent}`} />
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          </GuildCard>
        ))}
      </div>

      {/* Skills + Quest History */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Skills panel */}
        <GuildCard className="border-slate-200/80 lg:col-span-1">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-4 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-orange-500" /> Skills
              </h2>
              {a.profile?.skills && a.profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {a.profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No skills listed yet</p>
              )}
              {a.profile?.specialization && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Specialization</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{a.profile.specialization}</p>
                </div>
              )}
              {a.profile && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completion Rate</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{a.profile.completionRate}%</p>
                </div>
              )}
            </div>
          </GuildPanel>
        </GuildCard>

        {/* Quest history */}
        <GuildCard className="border-slate-200/80 lg:col-span-2">
          <GuildPanel asChild className="border-0 bg-transparent shadow-none">
            <div className="space-y-4 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Target className="h-4 w-4 text-orange-500" /> Quest History
              </h2>
              {a.questHistory.length > 0 ? (
                <div className="space-y-3">
                  {a.questHistory.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{q.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="outline" className={`text-[10px] ${difficultyColor(q.difficulty)}`}>
                            {q.difficulty}-Rank
                          </Badge>
                          <span>{new Date(q.completedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-semibold text-orange-600">+{q.xpEarned} XP</p>
                          {q.qualityScore !== null && (
                            <p className="text-xs text-slate-500">{q.qualityScore}/10</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  No completed quests yet. The adventure begins soon.
                </div>
              )}
            </div>
          </GuildPanel>
        </GuildCard>
      </div>

      {/* Footer: verification + share */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 sm:flex-row">
        <span>
          Verified Guild Card — Adventurers Guild
        </span>
        <a
          href={`https://adventurersguild.space/adventurer/${a.username || a.id}`}
          className="flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Share this card
        </a>
      </div>
    </GuildPage>
  );
}
