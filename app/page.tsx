'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/ui/animated-shader-hero';
import RankJourney from '@/components/landing/RankJourney';
import TrustStrip from '@/components/landing/LogoMarquee';
import HowItWorks from '@/components/landing/HowItWorks';
import QuestShowcase from '@/components/landing/QuestShowcase';

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
      {/* Hero — broader service scope, not just code */}
      <div className="relative">
        <Hero
          trustBadge={{ text: 'No unpaid internships · No fake projects · No coffee runs' }}
          headline={{
            line1: 'Get paid to do real',
            line2: 'digital work.',
          }}
          subtitle="Marketing. Design. Code. Content. Ads. Whatever you're good at, India's small businesses need it done. Pick a task, ship it, get paid. Climb from F to S as your work speaks."
          buttons={{
            primary: { text: 'Start at F-Rank', href: '/register' },
            secondary: { text: 'See how it works', href: '#how-it-works' },
          }}
        />

        {/* Rank ladder — restrained, in a single chip */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
              {RANKS.map((rank, i) => (
                <span
                  key={rank}
                  className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${
                    i === 0
                      ? 'bg-orange-400 text-slate-950'
                      : 'border border-white/15 text-white/30'
                  }`}
                >
                  {rank}
                </span>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
              Everyone starts at F-Rank
            </p>
          </div>
        </div>
      </div>

      {/* #1 — The Rank Journey (main attraction) */}
      <section id="ranks">
        <RankJourney />
      </section>

      {/* #3 — Trust signals (MIT, Open Paws, BharatCode, live numbers) */}
      <TrustStrip />

      {/* #4 — How it works (single column, large numbers) */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* #5 — Live quest board + top adventurers */}
      <section id="quests">
        <QuestShowcase />
      </section>
    </>
  );
}
