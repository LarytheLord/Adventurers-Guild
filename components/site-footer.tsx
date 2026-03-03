'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Join as Adventurer', href: '/register' },
    { label: 'Post Quests', href: '/register-company' },
    { label: 'Sign In', href: '/login' },
  ],
  resources: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export function SiteFooter() {
  const pathname = usePathname();

  // Dashboard and admin have their own layouts — no global footer needed
  if (pathname?.startsWith('/dashboard') || pathname === '/admin') return null;

  return (
    <footer className="bg-slate-900">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-16 border-b border-slate-800">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/home" className="flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
                <span className="text-black font-bold text-sm">AG</span>
              </div>
              <span className="text-white font-bold text-lg">Adventurers Guild</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">
              The quest board for ambitious developers. Earn XP, climb from F to S‑Rank,
              and get paid for code that ships to production.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="https://github.com" icon={<Github className="w-4 h-4" />} label="GitHub" />
              <SocialLink href="https://twitter.com" icon={<Twitter className="w-4 h-4" />} label="Twitter" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} The Adventurers Guild. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built for developers who ship.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}
