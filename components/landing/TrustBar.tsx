'use client';

import { useEffect, useState } from 'react';

type Stats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

export default function TrustBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-slate-950 border-b border-slate-800">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Open Source (MIT)
          </span>
          <span className="hidden sm:inline text-slate-700">·</span>
          <span className="hidden sm:inline">Backed by Open Paws</span>
          <span className="text-slate-700">·</span>
          <span>
            {stats ? `${stats.adventurers.toLocaleString()} Adventurers` : 'Loading...'}
          </span>
          <span className="text-slate-700">·</span>
          <span>
            {stats ? `${stats.openQuests} Active Quests` : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}
