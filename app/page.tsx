'use client';

import HeroSection from '@/components/landing/HeroSection';
import LogoMarquee from '@/components/landing/LogoMarquee';
import HowItWorks from '@/components/landing/HowItWorks';
import BentoGrid from '@/components/landing/BentoGrid';
import QuestShowcase from '@/components/landing/QuestShowcase';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <HeroSection />
      <LogoMarquee />
      <HowItWorks />
      <BentoGrid />
      <QuestShowcase />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
