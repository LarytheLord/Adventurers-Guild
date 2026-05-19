import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card';
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    if (variant === 'card') {
      return (
        <div className={cn('rounded-2xl border border-slate-800/40 bg-slate-900/30 p-5', className)} {...props} ref={ref}>
          <div className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-800" />
            </div>
            <div className="h-4 w-16 rounded-full bg-slate-800" />
          </div>
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-800/50" />
            <div className="h-3 w-2/3 rounded bg-slate-800/50" />
          </div>
          <div className="mt-4 flex gap-2 animate-pulse">
            <div className="h-5 w-14 rounded bg-slate-800/50" />
            <div className="h-5 w-14 rounded bg-slate-800/50" />
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-800/40 pt-3 animate-pulse">
            <div className="h-5 w-16 rounded-md bg-slate-800" />
            <div className="ml-auto h-3 w-12 rounded bg-slate-800" />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('animate-pulse rounded bg-slate-800', className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
