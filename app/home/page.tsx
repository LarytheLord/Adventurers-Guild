'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/ui/animated-shader-hero';
import BentoGrid from '@/components/landing/BentoGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  return (
    <>
      <Hero
        trustBadge={{
          text: 'Season 1 · Real projects · Real pay',
          icons: ['⚔️', '🏆', '🔥'],
        }}
        headline={{
          line1: 'Level Up Your Career',
          line2: 'One Quest at a Time',
        }}
        subtitle="The Adventurers Guild connects ambitious developers with real-world projects from companies. Earn XP, climb from F-Rank to S-Rank, and get paid for code that ships."
        buttons={{
          primary: { text: 'Start Your Journey', href: '/register' },
          secondary: { text: 'Browse Quests', href: '/register' },
        }}
      />
      <StatsSection />
      <BentoGrid />
      <HowItWorks />
      <CTASection />
    </>
  );
}
