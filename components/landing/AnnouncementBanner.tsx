'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Zap } from 'lucide-react';

// ─── Edit this to change the announcement ───────────────────────────────────
const ANNOUNCEMENT = {
  id: 'bharatcode-collab-jun16',          // change this ID to force banner to reappear
  badge: '🤝 New collab',
  text: 'BharatCode is giving our students free compute + AI tools.',
  cta: 'Join the live session · 16 Jun, 9:45 PM',
  ctaHref: 'https://bharatcode.ai',
  expiresAt: '2026-06-17T00:00:00+05:30', // auto-hides after this date
};
// ────────────────────────────────────────────────────────────────────────────

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or expired
    const dismissed = localStorage.getItem(`banner-${ANNOUNCEMENT.id}`);
    const expired = new Date() > new Date(ANNOUNCEMENT.expiresAt);
    if (!dismissed && !expired) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(`banner-${ANNOUNCEMENT.id}`, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-50 w-full bg-slate-900 border-b border-white/8">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* Badge */}
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-orange-400/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-400 sm:flex">
          <Zap className="size-3" />
          {ANNOUNCEMENT.badge}
        </span>

        {/* Text */}
        <p className="flex-1 text-[13px] text-white/70">
          <span className="font-medium text-white/90">{ANNOUNCEMENT.text}</span>
          {' '}
          <Link
            href={ANNOUNCEMENT.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-orange-400 underline-offset-2 hover:underline"
            onClick={dismiss}
          >
            {ANNOUNCEMENT.cta} →
          </Link>
        </p>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded p-1 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
