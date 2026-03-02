import { cn } from '@/lib/utils';

type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

const rankStyles: Record<Rank, { bg: string; text: string; glow: string; border: string }> = {
  S: {
    bg: 'bg-red-500',
    text: 'text-white',
    glow: 'shadow-red-500/40',
    border: 'border-red-400',
  },
  A: {
    bg: 'bg-orange-500',
    text: 'text-black',
    glow: 'shadow-orange-500/40',
    border: 'border-orange-400',
  },
  B: {
    bg: 'bg-amber-400',
    text: 'text-black',
    glow: 'shadow-amber-400/40',
    border: 'border-amber-300',
  },
  C: {
    bg: 'bg-violet-500',
    text: 'text-white',
    glow: 'shadow-violet-500/40',
    border: 'border-violet-400',
  },
  D: {
    bg: 'bg-blue-500',
    text: 'text-white',
    glow: 'shadow-blue-500/40',
    border: 'border-blue-400',
  },
  E: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    glow: 'shadow-emerald-500/40',
    border: 'border-emerald-400',
  },
  F: {
    bg: 'bg-slate-500',
    text: 'text-white',
    glow: 'shadow-slate-500/30',
    border: 'border-slate-400',
  },
};

const sizeStyles = {
  sm: 'w-6 h-6 text-xs font-bold',
  md: 'w-8 h-8 text-sm font-bold',
  lg: 'w-11 h-11 text-base font-bold',
  xl: 'w-14 h-14 text-lg font-extrabold',
};

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  className?: string;
}

export function RankBadge({ rank, size = 'md', glow = false, className }: RankBadgeProps) {
  const styles = rankStyles[rank];
  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center border select-none',
        styles.bg,
        styles.text,
        styles.border,
        sizeStyles[size],
        glow && `shadow-lg ${styles.glow}`,
        className
      )}
    >
      {rank}
    </div>
  );
}

export type { Rank };
