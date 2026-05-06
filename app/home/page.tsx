'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/ui/animated-shader-hero';
import HowItWorks from '@/components/landing/HowItWorks';
import CTASection from '@/components/landing/CTASection';
import QuestShowcase from '@/components/landing/QuestShowcase';
import LogoMarquee from '@/components/landing/LogoMarquee';
import TrustBar from '@/components/landing/TrustBar';
import ProductPreview from '@/components/landing/ProductPreview';
import WhyAG from '@/components/landing/WhyAG';
import RankJourney from '@/components/landing/RankJourney';

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
            text: 'Season 1 / Real projects / Real pay',
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

      {/* Trust Bar — credibility right after hero */}
      <TrustBar />

      {/* Product Preview — show the product before explaining it */}
      <ProductPreview />

      {/* How It Works — 3-step redesigned */}
      <HowItWorks />

      {/* Quest Showcase — live quest cards */}
      <QuestShowcase />

      {/* Why AG — competitive differentiation */}
      <WhyAG />

      {/* Rank Journey — F-to-S interactive timeline */}
      <RankJourney />

      {/* CTA */}
      <CTASection />

      {/* Trusted Partners */}
      <LogoMarquee />
    </>
  );
}
