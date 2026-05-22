'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Coins,
  Home,
  Search,
  Sparkles,
  Sword,
  Target,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

interface QuestDetail {
  id: string;
  title: string;
  description: string;
  detailedDescription: string | null;
  company: string;
  companyId: string | null;
  difficulty: string;
  track: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
  status: string;
  createdAt: string;
}

function formatDeadline(iso: string | null): { label: string; urgent: boolean } {
  if (!iso) return { label: 'No deadline', urgent: false };
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Expired', urgent: true };
  if (days === 0) return { label: 'Today', urgent: true };
  if (days === 1) return { label: '1 day left', urgent: true };
  if (days <= 7) return { label: `${days} days left`, urgent: true };
  return { label: `${days} days left`, urgent: false };
}

function PostedDate({ iso }: { iso: string }) {
  const days = Math.ceil((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return <>Posted today</>;
  if (days === 1) return <>Posted 1 day ago</>;
  if (days < 30) return <>Posted {days} days ago</>;
  const months = Math.floor(days / 30);
  return <>Posted {months} month{months > 1 ? 's' : ''} ago</>;
}

export default function QuestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchQuest() {
      try {
        const res = await fetch(`/api/public/quests/${id}`);
        if (res.status === 404) {
          if (!cancelled) setError(true);
          return;
        }
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        if (!cancelled) setQuest(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQuest();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !quest) {
    return <NotFoundState />;
  }

  const displayRank = (quest.difficulty as Rank) || 'D';
  const deadline = formatDeadline(quest.deadline);
  const isPastDeadline = quest.deadline !== null && new Date(quest.deadline).getTime() < Date.now();
  const isExpired = quest.status !== 'available' || isPastDeadline;

  if (isExpired) {
    return <ExpiredState quest={quest} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-slate-800/40 bg-slate-900/30">
        <div className="container mx-auto max-w-5xl px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3 w-3" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/quests" className="hover:text-white transition-colors">
              Quests
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-slate-400 max-w-[200px]">{quest.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Quest Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-800/60 pt-12 pb-16 md:pt-16 md:pb-20">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.06), transparent)',
          }}
        />

        <div className="relative container mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Back link */}
            <Link
              href="/quests"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to quests
            </Link>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <RankBadge rank={displayRank} size="sm" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-800/25 bg-indigo-950/30 px-3 py-0.5 text-[10px] font-medium text-indigo-300">
                <Target className="h-3 w-3" />
                {quest.track}
              </span>
              <span className="text-[11px] text-slate-500">
                <PostedDate iso={quest.createdAt} />
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {quest.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">
              {quest.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="p-6">
                <h2 className="text-base font-semibold text-white mb-3">About this quest</h2>
                <div className="text-sm leading-relaxed text-slate-400 space-y-3">
                  {quest.detailedDescription ? (
                    quest.detailedDescription.split('\n').map((p, i) => <p key={i}>{p}</p>)
                  ) : (
                    <p>{quest.description}</p>
                  )}
                </div>
              </GlassCard>

              {/* Skills */}
              {quest.requiredSkills.length > 0 && (
                <GlassCard className="p-6">
                  <h2 className="text-base font-semibold text-white mb-3">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {quest.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Rewards */}
              <GlassCard className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Rewards
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm text-slate-400">XP</span>
                    </div>
                    <span className="text-sm font-bold text-white">{quest.xpReward.toLocaleString()}</span>
                  </div>
                  {quest.monetaryReward != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-slate-400">Payout</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">${quest.monetaryReward}</span>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Details */}
              <GlassCard className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sword className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">Difficulty</span>
                    </div>
                    <RankBadge rank={displayRank} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">Applicants</span>
                    </div>
                    <span className="text-sm font-medium text-white">{quest.applicants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${deadline.urgent ? 'text-red-400' : 'text-slate-500'}`} />
                      <span className="text-sm text-slate-400">Deadline</span>
                    </div>
                    <span className={`text-sm font-medium ${deadline.urgent ? 'text-red-400' : 'text-slate-300'}`}>
                      {deadline.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">Est. time</span>
                    </div>
                    <span className="text-sm text-slate-300">—</span>
                  </div>
                </div>
              </GlassCard>

              {/* Company */}
              <GlassCard className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Company
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 ring-1 ring-indigo-800/30">
                    <span className="text-sm font-bold text-indigo-400">
                      {quest.company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{quest.company}</p>
                    <Link
                      href={quest.companyId ? `/companies/${quest.companyId}` : '#'}
                      className="text-[11px] text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </GlassCard>

              {/* CTA */}
              <Link href="/register">
                <GlowButton className="w-full justify-center" size="lg">
                  <Briefcase className="h-4 w-4" />
                  Apply for this quest
                </GlowButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Loading ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800/40 bg-slate-900/30">
        <div className="container mx-auto max-w-5xl px-6 py-3">
          <div className="h-3 w-48 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
      <div className="container mx-auto max-w-5xl px-6 pt-16 pb-20">
        <div className="space-y-6">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />
          <div className="grid gap-8 lg:grid-cols-3 pt-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
            </div>
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
              <div className="h-40 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 404 ─── */
function NotFoundState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/50 mx-auto">
          <Search className="h-6 w-6 text-slate-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">Quest not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This quest doesn&apos;t exist or has been removed.
        </p>
        <Link href="/quests">
          <GlowButton className="mt-6" size="lg">
            <ArrowLeft className="h-4 w-4" />
            Browse all quests
          </GlowButton>
        </Link>
      </div>
    </div>
  );
}

/* ─── Expired ─── */
function ExpiredState({ quest }: { quest: QuestDetail }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-800/30 mx-auto">
          <Clock className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">This quest is no longer available</h1>
        <p className="mt-2 text-sm text-slate-500">
          {quest.title} has expired or been filled. Check out other open quests.
        </p>
        <Link href="/quests">
          <GlowButton className="mt-6" size="lg">
            <Sparkles className="h-4 w-4" />
            Browse open quests
          </GlowButton>
        </Link>
      </div>
    </div>
  );
}
