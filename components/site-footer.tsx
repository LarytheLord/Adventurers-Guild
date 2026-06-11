'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin, ExternalLink } from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

const footerLinks = {
  platform: [
    { label: 'Quest Board', href: '/quests' },
    { label: 'Guild Card', href: '/register' },
    { label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { label: 'Register', href: '/register' },
    { label: 'Sign In', href: '/login' },
  ],
  community: [
    { label: 'WhatsApp Community', href: 'https://chat.whatsapp.com/FFR8bOzvsJr3xHDnhGpB95', external: true },
    { label: 'GitHub', href: 'https://github.com/LarytheLord/Adventurers-Guild', external: true },
    { label: 'Discussions', href: 'https://github.com/LarytheLord/Adventurers-Guild/discussions', external: true },
    { label: 'Contributing', href: 'https://github.com/LarytheLord/Adventurers-Guild/blob/main/CONTRIBUTING.md', external: true },
    { label: 'Open Issues', href: 'https://github.com/LarytheLord/Adventurers-Guild/issues', external: true },
  ],
  company: [
    { label: 'Post Quests', href: '/register-company' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: 'mailto:abid@guilds.work' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socials = [
  { href: 'https://github.com/LarytheLord/Adventurers-Guild', icon: Github, label: 'GitHub' },
  { href: 'https://x.com/AdvGuildHQ', icon: XIcon, label: 'X' },
  { href: 'https://www.linkedin.com/company/adventurers-guild', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://chat.whatsapp.com/FFR8bOzvsJr3xHDnhGpB95', icon: WhatsAppIcon, label: 'WhatsApp' },
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
            <Link href="/" className="group mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20 transition-colors group-hover:bg-orange-600">
                <span className="text-sm font-bold text-black">AG</span>
              </div>
              <span className="text-lg font-bold text-white">Guild</span>
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
            &copy; {new Date().getFullYear()} Guild. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built for developers who ship.
          </p>
        </div>
      </div>
    </footer>
  );
}
