'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductPreview from '@/components/landing/ProductPreview';
import CTASection from '@/components/landing/CTASection';
import HowItWorks from '@/components/landing/HowItWorks';
import LogoMarquee from '@/components/landing/LogoMarquee';
import QuestShowcase from '@/components/landing/QuestShowcase';
import RankJourney from '@/components/landing/RankJourney';
import TrustBar from '@/components/landing/TrustBar';
import WhyAG from '@/components/landing/WhyAG';
import Hero from '@/components/ui/animated-shader-hero';

const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;

type LandingStats = {
  adventurers: number;
  companies: number;
  completedQuests: number;
  openQuests: number;
};

type PublicQuest = {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: (typeof RANKS)[number];
  track: string;
  source: string;
  xpReward: number;
  monetaryReward: number | null;
  deadline: string | null;
  requiredSkills: string[];
  applicants: number;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<LandingStats>({
    adventurers: 0,
    companies: 0,
    completedQuests: 0,
    openQuests: 0,
  });
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [landingLoading, setLandingLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role;
      if (userRole === 'company') router.push('/dashboard/company');
      else if (userRole === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLandingData() {
      try {
        const [statsResponse, questsResponse] = await Promise.all([
          fetch('/api/public/stats'),
          fetch('/api/public/quests'),
        ]);

        const [statsData, questsData] = await Promise.all([
          statsResponse.ok ? statsResponse.json() : Promise.resolve(null),
          questsResponse.ok ? questsResponse.json() : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setStats({
          adventurers: statsData?.adventurers ?? 0,
          companies: statsData?.companies ?? 0,
          completedQuests: statsData?.completedQuests ?? 0,
          openQuests: statsData?.openQuests ?? 0,
        });
        setQuests(Array.isArray(questsData?.quests) ? questsData.quests : []);
      } catch {
        if (!cancelled) {
          setStats({
            adventurers: 0,
            companies: 0,
            completedQuests: 0,
            openQuests: 0,
          });
          setQuests([]);
        }
      } finally {
        if (!cancelled) {
          setLandingLoading(false);
        }
      }
    }

    void fetchLandingData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="relative">
        <Hero
          trustBadge={{
            text: 'Season 1 / Real projects / Real pay',
            icons: ['XP', 'QA', '$'],
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

        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {RANKS.map((rank, index) => (
              <div
                key={rank}
                className={`rounded flex items-center justify-center font-bold text-[9px] transition-all ${
                  index === 0
                    ? 'w-5 h-5 bg-orange-500 text-black shadow-md shadow-orange-500/40'
                    : 'w-4 h-4 bg-white/10 text-white/25'
                }`}
              >
                {rank}
              </div>
            ))}
          </div>
          <p className="text-[10px] tracking-wide text-white/25">Everyone starts at F-Rank</p>
        </div>
      </div>

      <section id="trust">
        <TrustBar adventurers={stats.adventurers} openQuests={stats.openQuests} loading={landingLoading} />
      </section>
      <section id="product-preview">
        <ProductPreview
          quests={quests}
          completedQuests={stats.completedQuests}
          companies={stats.companies}
          loading={landingLoading}
        />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="quests">
        <QuestShowcase quests={quests} loading={landingLoading} />
      </section>
      <section id="why-ag">
        <WhyAG />
      </section>
      <section id="rank-journey">
        <RankJourney quests={quests} loading={landingLoading} />
      </section>
      <section id="join">
        <CTASection />
      </section>

      <LogoMarquee />
    </>
  );
}
