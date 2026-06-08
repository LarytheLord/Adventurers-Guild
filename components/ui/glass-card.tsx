import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: 'indigo' | 'emerald' | 'amber' | 'none';
}

const glowStyles = {
  indigo: 'hover:border-indigo-800/40 hover:shadow-[0_0_30px_-8px_rgba(99,102,241,0.12)]',
  emerald: 'hover:border-emerald-800/40 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.12)]',
  amber: 'hover:border-amber-800/40 hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.12)]',
  none: '',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = 'indigo', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-sm transition-all duration-300',
          hover && glowStyles[glow],
          hover && 'hover:bg-slate-900',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
