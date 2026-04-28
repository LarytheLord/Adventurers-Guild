'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, LayoutDashboard, Shield } from 'lucide-react';

import { cn } from '@/lib/utils';

const adminLinks = [
  {
    href: '/admin',
    label: 'Overview',
    description: 'Pilot operations and platform status',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/quests',
    label: 'Quests',
    description: 'Review, annotate, and moderate quests',
    icon: ClipboardList,
  },
  {
    href: '/admin/revenue',
    label: 'Revenue',
    description: 'GMV, take rate, and payout health',
    icon: BarChart3,
  },
] as const;

export function AdminRail() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
      <div className="guild-panel overflow-hidden border-slate-900 bg-slate-950 text-slate-100">
        <div className="border-b border-slate-800 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
                Admin Command
              </p>
              <h2 className="text-lg font-semibold text-white">Guild Console</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Keep the board healthy, unblock delivery, and watch the platform economics in one place.
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
          {adminLinks.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'min-w-[220px] rounded-2xl border px-4 py-3 transition-colors lg:min-w-0',
                  active
                    ? 'border-orange-400/50 bg-gradient-to-r from-orange-500/20 to-amber-400/10 text-white'
                    : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border',
                      active
                        ? 'border-orange-400/40 bg-orange-400/10 text-orange-200'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
