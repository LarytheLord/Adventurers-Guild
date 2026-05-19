'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Browse Quests', href: '/quests' },
    { label: 'For Companies', href: '/register-company' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Rank System', href: '/ranks' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Status', href: '/status' },
    { label: 'Community', href: '/community' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      {/* Main footer */}
      <div className="container mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                AG
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Adventurers Guild
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
              The quest-based platform where developers build real skills, earn real income,
              and climb from F-Rank to S-Rank.
            </p>
            <div className="mt-5 flex gap-3">
              {['GitHub', 'Twitter', 'Discord'].map((social) => (
                <Link
                  key={social}
                  href={`/${social.toLowerCase()}`}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition-all hover:border-slate-700 hover:text-slate-300"
                >
                  {social}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/40">
        <div className="container mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-600 md:flex-row">
            <p>&copy; {new Date().getFullYear()} Adventurers Guild. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
