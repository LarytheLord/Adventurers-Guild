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
    <div className="border-b border-slate-800 bg-slate-950 py-3">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open Source (MIT)
          </span>
          <span>Backed by Open Paws</span>
          <span className="tabular-nums">
            {stats ? `${stats.adventurers.toLocaleString()} Adventurers` : '— Adventurers'}
          </span>
          <span className="tabular-nums">
            {stats ? `${stats.openQuests.toLocaleString()} Active Quests` : '— Active Quests'}
          </span>
        </div>
      </div>
    </div>
  );
}
