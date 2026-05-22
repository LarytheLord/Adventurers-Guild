'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Coins,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: string;
  xpReward: number;
  monetaryReward: number | null;
  requiredSkills: string[];
  applicants: number;
}

export function CategoryQuestsClient({ slug, label }: { slug: string; label: string }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchParam = label.toLowerCase();

  useEffect(() => {
    let cancelled = false;
    async function fetchQuests() {
      try {
        const res = await fetch(`/api/public/quests?category=${slug}`);
        const data = await res.json();
        if (!cancelled) setQuests(data.quests || []);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchQuests();
    return () => { cancelled = true; };
  }, [slug]);

  const filtered = useMemo(
    () =>
      quests.filter((q) => {
        const qs = search.toLowerCase();
        return !qs ||
          q.title.toLowerCase().includes(qs) ||
          q.description.toLowerCase().includes(qs) ||
          q.company.toLowerCase().includes(qs);
      }),
    [quests, search]
  );

  if (loading) {
    return (
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl border border-slate-800 bg-slate-900 p-5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/50">
              <Search className="h-6 w-6 text-slate-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">No {searchParam} quests right now</h3>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon — new quests are added regularly.
            </p>
            <Link href="/quests">
              <button className="mt-5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800">
                Browse all quests
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder={`Search ${searchParam} quests...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-600/40 focus:ring-1 focus:ring-indigo-600/20"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Link href={`/quests/${quest.id}`} className="group block h-full">
                <div className="relative flex h-full flex-col rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-800/40 hover:shadow-[0_0_30px_-8px_rgba(99,102,241,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 ring-1 ring-indigo-800/30">
                        <span className="text-[10px] font-bold text-indigo-400">
                          {quest.company.charAt(0)}
                        </span>
                      </div>
                      <span className="truncate text-xs text-slate-500">{quest.company}</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-200 transition-colors group-hover:text-indigo-300">
                    {quest.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2 flex-1">
                    {quest.description}
                  </p>

                  {quest.requiredSkills && quest.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {quest.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3 border-t border-slate-800/40 pt-3">
                    <div className="flex items-center gap-1.5 rounded-md bg-indigo-500/8 px-2 py-1">
                      <Zap className="h-3 w-3 text-indigo-400" />
                      <span className="text-[11px] font-semibold text-indigo-400">{quest.xpReward}</span>
                    </div>
                    {quest.monetaryReward && (
                      <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/8 px-2 py-1">
                        <Coins className="h-3 w-3 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-400">${quest.monetaryReward}</span>
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
                      <Briefcase className="h-3 w-3" />
                      {quest.applicants}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
