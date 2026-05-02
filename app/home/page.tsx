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

  // 🔥 Prevent UI flash before redirect
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center text-white/60 text-sm">
        Loading Guild...
      </div>
    );
  }

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

        <Hero
          trustBadge={{
            text: 'Season 1 / Real projects / Real pay',
          }}
          headline={{
            line1: 'Level Up Your Career',
            line2: 'One Quest at a Time',
          }}
          subtitle="Join the Adventurers Guild. Complete real-world coding quests, earn XP, climb from F-Rank to S-Rank, and get paid for production-ready work."
          buttons={{
            primary: { text: '⚔ Enter the Guild', href: '/register' },
            secondary: { text: '📜 Browse Quests', href: '/register' },
          }}
        />

        {/* 🔥 Improved Rank Ladder */}
        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/10">
            {RANKS.map((rank, i) => (
              <div
                key={rank}
                className={`
                  flex items-center justify-center font-bold text-[10px]
                  transition-all duration-300
                  ${
                    i === 0
                      ? 'w-6 h-6 bg-orange-500 text-black shadow-lg shadow-orange-500/50 scale-110'
                      : 'w-5 h-5 bg-white/10 text-white/30 hover:bg-white/20'
                  }
                `}
              >
                {rank}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/40 tracking-wide">
            Your journey begins at F-Rank ⚡
          </p>
        </div>
      </div>

      {/* Sections with better spacing + transitions */}

      <section id="features" className="relative py-20 border-t border-white/5">
        <StatsSection />
      </section>

      <section id="quests" className="relative py-20 border-t border-white/5">
        <QuestShowcase />
      </section>

      <section id="experience" className="relative py-20 border-t border-white/5">
        <BentoGrid />
      </section>

      <section id="how-it-works" className="relative py-20 border-t border-white/5">
        <HowItWorks />
      </section>

      <section id="join" className="relative py-20 border-t border-white/5">
        <CTASection />
      </section>

      {/* Trusted Partners */}
      <div className="border-t border-white/5 pt-10 pb-16">
        <LogoMarquee />
      </div>
    </div>
  );
}