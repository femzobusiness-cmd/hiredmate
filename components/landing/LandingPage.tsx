'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { CtaSection } from '@/components/landing/sections/CtaSection';
import { FaqSection } from '@/components/landing/sections/FaqSection';
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection';
import { FooterSection } from '@/components/landing/sections/FooterSection';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { HospitalsSection } from '@/components/landing/sections/HospitalsSection';
import { PricingSection } from '@/components/landing/sections/PricingSection';
import { StatsSection } from '@/components/landing/sections/StatsSection';
import { StepsSection } from '@/components/landing/sections/StepsSection';
import { TestimonialsSection } from '@/components/landing/sections/TestimonialsSection';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FF]">
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
