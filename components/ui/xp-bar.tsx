'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Rank } from './rank-badge';

interface XPBarProps {
  currentXP: number;
  currentRank: Rank;
  nextRank: Rank | null;
  progressPercent: number;
  xpToNext?: number;
  className?: string;
  animate?: boolean;
}

const rankColors: Record<Rank, string> = {
  S: 'bg-red-500',
  A: 'bg-orange-500',
  B: 'bg-amber-400',
  C: 'bg-violet-500',
  D: 'bg-blue-500',
  E: 'bg-emerald-500',
  F: 'bg-slate-500',
};

export function XPBar({
  currentXP,
  currentRank,
  nextRank,
  progressPercent,
  xpToNext,
  className,
  animate = true,
}: XPBarProps) {
  const [width, setWidth] = useState(animate ? 0 : progressPercent);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(progressPercent), 100);
    return () => clearTimeout(timer);
  }, [progressPercent, animate]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-slate-400 font-medium">{currentRank}-Rank</span>
        <span className="text-slate-500">{currentXP.toLocaleString()} XP</span>
        {nextRank && (
          <span className="text-slate-400 font-medium">{nextRank}-Rank</span>
        )}
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            rankColors[currentRank]
          )}
          style={{ width: `${Math.min(width, 100)}%` }}
        />
      </div>
      {xpToNext !== undefined && nextRank && (
        <p className="mt-1 text-xs text-slate-600">
          {xpToNext.toLocaleString()} XP to {nextRank}-Rank
        </p>
      )}
    </div>
  );
}
