'use client';

import { useEffect, useState } from 'react';
import { Zap, DollarSign, Clock, Users } from 'lucide-react';
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
  if (!iso) return 'Flexible';
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Due today';
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
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Open quests
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Available projects
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-lg border-slate-200 text-sm"
          >
            <Link href="/register">View all quests</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-500">No open quests right now — check back soon.</p>
            <Button asChild variant="outline" className="mt-4 rounded-lg border-slate-200 text-sm">
              <Link href="/register">Join the waitlist</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function QuestCard({ quest }: { quest: PublicQuest }) {
  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <RankBadge rank={quest.difficulty} size="sm" />
        <span className="text-xs text-slate-400">{quest.company}</span>
      </div>

      <h3 className="mb-1 text-base font-semibold leading-snug text-slate-900">{quest.title}</h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{quest.description}</p>

      {quest.requiredSkills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {quest.requiredSkills.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>{quest.xpReward.toLocaleString()} XP</span>
          </div>
          {quest.monetaryReward != null ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span>${quest.monetaryReward}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Unpaid</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDeadline(quest.deadline)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>{quest.applicants} applied</span>
          </div>
        </div>

        <Button asChild className="mt-4 h-9 w-full rounded-lg text-sm">
          <Link href={`/register?quest=${quest.id}`}>View details</Link>
        </Button>
      </div>
    </div>
  );
}
