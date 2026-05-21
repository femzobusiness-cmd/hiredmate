'use client';

import { BackgroundLayer } from '@/components/landing/BackgroundLayer';
import { CtaSection } from '@/components/landing/CtaSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HospitalsSection } from '@/components/landing/HospitalsSection';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { PricingSection } from '@/components/landing/PricingSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { StepsSection } from '@/components/landing/StepsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

export function LandingPage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundLayer />
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HospitalsSection />
        <StepsSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
