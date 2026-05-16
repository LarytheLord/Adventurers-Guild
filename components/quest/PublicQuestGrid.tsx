'use client';

import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicQuestCard, type PublicQuest } from '@/components/quest/PublicQuestCard';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 animate-pulse">
      <div className="mb-4 h-6 w-12 rounded bg-slate-800" />
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-800" />
      <div className="mb-3 h-3 w-1/2 rounded bg-slate-800" />
      <div className="mb-4 h-8 w-full rounded bg-slate-800" />
      <div className="mb-5 flex gap-1.5">
        <div className="h-5 w-14 rounded bg-slate-800" />
        <div className="h-5 w-16 rounded bg-slate-800" />
      </div>
      <div className="mb-4 h-px bg-slate-800" />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="h-4 rounded bg-slate-800" />
        <div className="h-4 rounded bg-slate-800" />
        <div className="h-4 rounded bg-slate-800" />
        <div className="h-4 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export function QuestGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function QuestGridError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
      <p className="text-slate-400 text-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export function QuestGridEmpty({ message = 'No quests found', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
      <SearchX className="mx-auto h-10 w-10 text-slate-600" />
      <h3 className="mt-4 text-lg font-semibold text-white">{message}</h3>
      <p className="mt-2 text-sm text-slate-400">No open quests right now — check back soon.</p>
      {action ?? (
        <Button asChild variant="outline" className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
          <Link href="/">Back to Home</Link>
        </Button>
      )}
    </div>
  );
}

export function PublicQuestGrid({
  quests,
  loading,
  error,
  onRetry,
  emptyMessage,
  emptyAction,
}: {
  quests: PublicQuest[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}) {
  if (loading) return <QuestGridSkeleton />;
  if (error) return <QuestGridError message={error} onRetry={onRetry} />;
  if (quests.length === 0) return <QuestGridEmpty message={emptyMessage} action={emptyAction} />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest, index) => (
        <PublicQuestCard key={quest.id} quest={quest} index={index} />
      ))}
    </div>
  );
}
