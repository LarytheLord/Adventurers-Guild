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
