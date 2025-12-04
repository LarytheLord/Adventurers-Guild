'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import LogoMarquee from '@/components/landing/LogoMarquee';
import BentoGrid from '@/components/landing/BentoGrid';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/Footer';

export default function LandingPage() {


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <HeroSection />
      <LogoMarquee />
      <BentoGrid />
      <StatsSection />
      <CTASection />

      <CTASection />
      <Footer />
    </div>
  );
}