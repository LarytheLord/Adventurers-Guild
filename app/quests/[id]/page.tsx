'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, DollarSign, Clock, Users, Target, ChevronRight, AlertCircle, CalendarX } from 'lucide-react';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type QuestDetail = {
  id: string;
  title: string;
  description: string;
  detailedDescription: string | null;
  questType: string;
  difficulty: Rank;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward: number | null;
  requiredSkills: string[];
  requiredRank: Rank | null;
  maxParticipants: number | null;
  questCategory: string;
  track: string;
  status: string;
  deadline: string | null;
  company: string;
  companyId: string | null;
  applicants: number;
};

export default function PublicQuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchQuest = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/quests/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setFetchError(true);
          return;
        }
        const data = await res.json();
        setQuest(data.quest);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    void fetchQuest();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="container mx-auto max-w-4xl px-6 py-10">
          <Skeleton className="mb-8 h-4 w-48" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-6 h-4 w-1/3" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="container mx-auto max-w-4xl px-6 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-600" />
          <h1 className="mt-4 text-2xl font-bold text-white">Quest not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            This quest doesn&apos;t exist or has been removed.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
              <Link href="/quests">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Quests
              </Link>
            </Button>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (fetchError || !quest) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="container mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-slate-400">Something went wrong. Please try again.</p>
          <Button asChild variant="outline" className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
            <Link href="/quests">Back to Quest Board</Link>
          </Button>
        </div>
      </main>
    );
  }

  const isExpired = quest.status !== 'available';
  const reward = quest.monetaryReward != null ? `$${quest.monetaryReward.toLocaleString()}` : null;

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/quests" className="hover:text-slate-300 transition-colors">Quests</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-400 truncate max-w-[200px]">{quest.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-10">
        {isExpired && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 p-4">
            <CalendarX className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">This quest is no longer available</p>
              <p className="text-xs text-amber-400/70">
                This quest has been {quest.status === 'completed' ? 'completed' : 'closed'}.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <RankBadge rank={quest.difficulty} size="md" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{quest.questCategory}</span>
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{quest.title}</h1>
              <p className="mt-2 text-sm text-slate-400">
                Posted by{' '}
                {quest.companyId ? (
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    {quest.company}
                  </a>
                ) : (
                  <span>{quest.company}</span>
                )}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">
              {quest.detailedDescription || quest.description}
            </p>

            {quest.requiredSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {quest.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {quest.requiredRank && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Target className="h-4 w-4 text-slate-500" />
                Minimum rank: <RankBadge rank={quest.requiredRank} size="sm" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Details</h3>
              <div className="space-y-3">
                <DetailRow icon={<Zap className="h-4 w-4 text-orange-400" />} label="XP" value={`${quest.xpReward.toLocaleString()} XP`} />
                <DetailRow icon={<Zap className="h-4 w-4 text-violet-400" />} label="SP" value={`${quest.skillPointsReward.toLocaleString()} SP`} />
                {reward ? (
                  <DetailRow icon={<DollarSign className="h-4 w-4 text-emerald-400" />} label="Reward" value={reward} />
                ) : (
                  <DetailRow icon={<DollarSign className="h-4 w-4 text-slate-600" />} label="Reward" value="XP Only" />
                )}
                <DetailRow icon={<Clock className="h-4 w-4 text-slate-500" />} label="Deadline" value={quest.deadline ? new Date(quest.deadline).toLocaleDateString() : 'None'} />
                <DetailRow icon={<Users className="h-4 w-4 text-slate-500" />} label="Applicants" value={quest.applicants.toString()} />
                {quest.maxParticipants && (
                  <DetailRow icon={<Users className="h-4 w-4 text-slate-500" />} label="Max Team" value={quest.maxParticipants.toString()} />
                )}
              </div>
            </div>

            {!isExpired && (
              <Button asChild className="w-full h-11 rounded-xl bg-orange-500 text-white hover:bg-orange-600">
                <Link href="/register">
                  <Target className="mr-2 h-4 w-4" />
                  Claim This Quest
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-xs font-medium text-slate-300">{value}</span>
    </div>
  );
}
