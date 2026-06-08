'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RankBadge } from '@/components/ui/rank-badge';
import type { UserRank } from '@prisma/client';

interface PublicQuest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  paymentAmount: number | null;
  category: string | null;
  skills: string[];
  company: { name: string } | null;
}

interface CategoryQuestsClientProps {
  slug: string;
  title: string;
  description: string;
  dbCategory: string;
}

export default function CategoryQuestsClient({
  title,
  description,
  dbCategory,
}: CategoryQuestsClientProps) {
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchQuests() {
      try {
        const res = await fetch(`/api/public/quests?category=${dbCategory}`);
        if (res.ok) {
          const data = await res.json();
          setQuests(data.quests ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchQuests();
  }, [dbCategory]);

  const filtered = quests.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/quests"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← All Quests
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search quests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-orange-500/30"
          />
        </div>

        {/* Quest grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-slate-500">
              {search ? 'No quests match your search.' : 'No quests in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((quest) => (
              <Link key={quest.id} href={`/quests/${quest.id}`} className="group block">
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 group-hover:border-slate-700 group-hover:bg-slate-800/80">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {quest.title}
                    </h3>
                    <RankBadge rank={quest.difficulty as UserRank} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{quest.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {quest.skills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[10px] border-slate-700 text-slate-400"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-orange-400">+{quest.xpReward} XP</p>
                      {quest.paymentAmount && quest.paymentAmount > 0 ? (
                        <p className="text-[10px] text-slate-500">
                          ₹{quest.paymentAmount.toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
