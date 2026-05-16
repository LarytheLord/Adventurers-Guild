import { Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function getStreakLabel(streak: number): string {
  if (streak >= 30) return 'Legendary';
  if (streak >= 14) return 'On Fire';
  if (streak >= 7) return 'Blazing';
  if (streak >= 3) return 'Burning';
  return 'Warm Up';
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

const streakStyles: Record<string, { bg: string; text: string; border: string; flame: string }> = {
  Legendary: { bg: 'bg-red-950/40', text: 'text-red-300', border: 'border-red-800/50', flame: 'text-red-400' },
  'On Fire': { bg: 'bg-orange-950/40', text: 'text-orange-300', border: 'border-orange-800/50', flame: 'text-orange-400' },
  Blazing: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-800/50', flame: 'text-amber-400' },
  Burning: { bg: 'bg-yellow-950/40', text: 'text-yellow-300', border: 'border-yellow-800/50', flame: 'text-yellow-400' },
  'Warm Up': { bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/50', flame: 'text-slate-500' },
};

export function StreakBadge({
  streak,
  showMultiplier = true,
  size = 'sm',
  className,
}: {
  streak: number;
  showMultiplier?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (streak <= 0) return null;

  const label = getStreakLabel(streak);
  const multiplier = getStreakMultiplier(streak);
  const style = streakStyles[label];

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-[11px] gap-1' : 'px-3 py-1.5 text-xs gap-1.5';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        style.bg, style.text, style.border, sizeClasses,
        className
      )}
    >
      <Flame className={cn('h-3.5 w-3.5', style.flame)} />
      <span>{streak}-day streak</span>
      {showMultiplier && (
        <span className="flex items-center gap-0.5 ml-0.5 opacity-80">
          <Zap className="h-3 w-3" />
          {multiplier}x XP
        </span>
      )}
    </div>
  );
}

export function StreakMultiplierNotice({ streak, xpReward }: { streak: number; xpReward: number }) {
  if (streak <= 0) return null;

  const multiplier = getStreakMultiplier(streak);
  if (multiplier <= 1) return null;

  const bonusXp = Math.round(xpReward * (multiplier - 1));

  return (
    <div className="rounded-xl border border-orange-800/40 bg-orange-950/20 p-3 text-xs">
      <div className="flex items-center gap-2 text-orange-300 font-medium">
        <Flame className="h-4 w-4" />
        Streak Active — {multiplier}x XP Multiplier
      </div>
      <p className="mt-1 text-orange-400/70">
        Your {streak}-day streak adds {bonusXp} bonus XP on approval.
      </p>
    </div>
  );
}
