'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl overflow-hidden group',
          size === 'sm' && 'h-9 px-4 text-xs',
          size === 'md' && 'h-11 px-6 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          variant === 'primary' && [
            'bg-indigo-600 text-white',
            'hover:bg-indigo-500',
            'shadow-[0_0_20px_-6px_rgba(99,102,241,0.3)]',
            'hover:shadow-[0_0_30px_-4px_rgba(99,102,241,0.5)]',
          ],
          variant === 'secondary' && [
            'border border-slate-700 bg-slate-900 text-slate-300',
            'hover:border-indigo-700/40 hover:bg-slate-800 hover:text-white',
          ],
          variant === 'ghost' && [
            'text-slate-400 hover:text-white hover:bg-slate-800/50',
          ],
          className
        )}
        {...props}
      >
        {variant === 'primary' && (
          <>
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(99,102,241,0) 100%)',
              }}
            />
            <span
              className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(99,102,241,0.3) 25%, transparent 50%, rgba(139,92,246,0.3) 75%, transparent 100%)',
                animation: 'glow-rotate 3s linear infinite',
              }}
            />
          </>
        )}
        <span className="relative flex items-center gap-2 z-10">{children}</span>
      </button>
    );
  }
);

GlowButton.displayName = 'GlowButton';

export { GlowButton };
