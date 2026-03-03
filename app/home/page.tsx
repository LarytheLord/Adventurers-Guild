'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/ui/animated-shader-hero';
import BentoGrid from '@/components/landing/BentoGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import QuestShowcase from '@/components/landing/QuestShowcase';
import LogoMarquee from '@/components/landing/LogoMarquee';
import { RankBadge } from '@/components/ui/rank-badge';

const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role;
      if (userRole === 'company') router.push('/dashboard/company');
      else if (userRole === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [status, session, router]);

  return (
    <>
      {/* Hero with game HUD overlays */}
      <div className="relative">
        <Hero
          trustBadge={{
            text: 'Season 1 · Real projects · Real pay',
            icons: ['⚔️', '🏆', '🔥'],
          }}
          headline={{
            line1: 'Level Up Your Career',
            line2: 'One Quest at a Time',
          }}
          subtitle="Connect with real companies. Complete coding quests. Earn XP, climb from F-Rank to S-Rank, and get paid for code that ships to production."
          buttons={{
            primary: { text: 'Enter the Guild', href: '/register' },
            secondary: { text: 'Browse Quests', href: '/register' },
          }}
        />

        {/* Floating quest card — desktop only */}
        <div className="hidden xl:block absolute bottom-24 right-14 w-56 backdrop-blur-md bg-white/[0.06] border border-white/[0.10] rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <RankBadge rank="D" size="sm" glow />
            <span className="text-[9px] font-semibold tracking-widest text-white/30 uppercase">Open</span>
          </div>
          <p className="text-white/90 text-xs font-semibold leading-snug mb-1">
            Build Webhook Handler for Stripe
          </p>
          <p className="text-white/35 text-[10px] mb-3">by PayFlow Inc.</p>
          <div className="flex items-center gap-2 text-[11px] font-semibold mb-3">
            <span className="text-orange-400">$150</span>
            <span className="text-white/20">·</span>
            <span className="text-white/50">500 XP</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['React', 'Node.js', 'Stripe'].map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-white/35"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rank ladder — bottom center */}
        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {RANKS.map((rank, i) => (
              <div
                key={rank}
                className={`rounded flex items-center justify-center font-bold text-[9px] transition-all ${
                  i === 0
                    ? 'w-5 h-5 bg-orange-500 text-black shadow-md shadow-orange-500/40'
                    : 'w-4 h-4 bg-white/10 text-white/25'
                }`}
              >
                {rank}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/25 tracking-wide">Everyone starts at F-Rank</p>
        </div>
      </div>

      <LogoMarquee />

      <section id="features">
        <StatsSection />
      </section>
      <section id="quests">
        <QuestShowcase />
      </section>
      <section id="experience">
        <BentoGrid />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="join">
        <CTASection />
      </section>
    </>
  );
}
