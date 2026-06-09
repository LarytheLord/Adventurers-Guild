'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface RecommendedQuest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  questCategory: string;
  company?: { name: string };
}

interface RecommendedQuestsProps {
  userRank: string;
}

/**
 * Recommended Quests Component
 *
 * Shows beginner-friendly quests (at or below user rank) to help new players
 * get started. Only shows for F/E rank users.
 *
 * Design: Lighter format - just 2-3 quest cards in a row, not overwhelming.
 */
export function RecommendedQuests({ userRank }: RecommendedQuestsProps) {
  const [quests, setQuests] = useState<RecommendedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only show recommendations for F/E rank users (beginners)
    if (userRank !== 'F' && userRank !== 'E') {
      setLoading(false);
      return;
    }

    const fetchRecommendedQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quests at user's rank (accessible quests)
        const res = await fetch(
          `/api/quests?difficulty=${userRank}&limit=4&status=available`
        );

        if (!res.ok) throw new Error('Failed to fetch recommendations');

        const data = await res.json();
        setQuests(Array.isArray(data.quests) ? data.quests : []);
      } catch (e) {
        console.error('Error fetching recommended quests:', e);
        setError('Could not load recommendations');
      } finally {
        setLoading(false);
      }
    };

    void fetchRecommendedQuests();
  }, [userRank]);

  // Don't show for non-beginner ranks
  if (userRank !== 'F' && userRank !== 'E') {
    return null;
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Sparkles className="h-5 w-5 text-orange-500" />
          Recommended for You
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error || quests.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Sparkles className="h-5 w-5 text-orange-500" />
        Recommended for You
      </h3>
      <p className="mb-4 text-sm text-slate-600">
        Great starter quests to build XP and level up
      </p>

      <div className="space-y-2">
        {quests.map((quest) => (
          <Link
            key={quest.id}
            href={`/dashboard/quests/${quest.id}`}
            className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3 transition-all hover:border-orange-300 hover:shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 line-clamp-1">
                {quest.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {quest.difficulty}-Rank
                </Badge>
                <span className="text-xs text-slate-500">
                  {quest.xpReward} XP
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </section>
  );
}
