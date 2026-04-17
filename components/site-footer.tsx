'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, MessageCircle, Linkedin, ExternalLink } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Quest Board', href: '/dashboard/quests' },
    { label: 'Guild Card', href: '/register' },
    { label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { label: 'Register', href: '/register' },
    { label: 'Sign In', href: '/login' },
  ],
  community: [
    { label: 'GitHub', href: 'https://github.com/LarytheLord/Adventurers-Guild', external: true },
    { label: 'Discussions', href: 'https://github.com/LarytheLord/Adventurers-Guild/discussions', external: true },
    { label: 'Contributing', href: 'https://github.com/LarytheLord/Adventurers-Guild/blob/main/CONTRIBUTING.md', external: true },
    { label: 'Open Issues', href: 'https://github.com/LarytheLord/Adventurers-Guild/issues', external: true },
  ],
  company: [
    { label: 'Post Quests', href: '/register-company' },
    { label: 'How It Works', href: '/home#how-it-works' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socials = [
  { href: 'https://github.com/LarytheLord/Adventurers-Guild', icon: Github, label: 'GitHub' },
  { href: 'https://x.com/AdventurersGuild', icon: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ), label: 'X' },
  { href: 'https://linkedin.com/company/adventurers-guild', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://discord.gg/adventurersguild', icon: MessageCircle, label: 'Discord' },
];

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-16 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand — spans 2 cols */}
          <div className="col-span-2">
            <Link href="/home" className="group mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20 transition-colors group-hover:bg-orange-600">
                <span className="text-sm font-bold text-black">AG</span>
              </div>
              <span className="text-lg font-bold text-white">Adventurers Guild</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              The credentialing engine for developers. Complete real quests, earn verified rank, build a portfolio that proves you can ship.
            </p>

            {/* Trust signals */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Open Source (MIT)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-400">
                Backed by Open Paws
              </span>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-500 transition-all hover:bg-slate-800 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Community
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-40" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Companies
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-4 mt-8 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/60 py-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Adventurers Guild. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built for developers who ship.
          </p>
        </div>
      </div>
    </footer>
  );
}
