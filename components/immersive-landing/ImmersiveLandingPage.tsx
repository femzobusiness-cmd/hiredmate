'use client';

import { AuroraBackground } from '@/components/immersive-landing/AuroraBackground';
import { BentoFeatures } from '@/components/immersive-landing/BentoFeatures';
import { FaqSection } from '@/components/immersive-landing/FaqSection';
import { FinalCta } from '@/components/immersive-landing/FinalCta';
import { GamificationSection } from '@/components/immersive-landing/GamificationSection';
import { GlobalEffects } from '@/components/immersive-landing/GlobalEffects';
import { HeroSection } from '@/components/immersive-landing/HeroSection';
import { HospitalShowcase } from '@/components/immersive-landing/HospitalShowcase';
import { ImmersiveFooter } from '@/components/immersive-landing/ImmersiveFooter';
import { ImmersiveNavbar } from '@/components/immersive-landing/ImmersiveNavbar';
import { PricingSection } from '@/components/immersive-landing/PricingSection';
import { StatsSection } from '@/components/immersive-landing/StatsSection';
import { TestimonialsMarquee } from '@/components/immersive-landing/TestimonialsMarquee';
import { VoicePracticeSection } from '@/components/immersive-landing/VoicePracticeSection';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ImmersiveLandingPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  return (
    <GlobalEffects>
      <div className="relative min-h-screen overflow-x-hidden bg-[#04000F] text-white selection:bg-purple-500/30">
        <AuroraBackground />
        <ImmersiveNavbar />
        <main>
          <HeroSection />
          <StatsSection />
          <BentoFeatures />
          <HospitalShowcase />
          <GamificationSection />
          <VoicePracticeSection />
          <TestimonialsMarquee />
          <PricingSection />
          <FaqSection />
          <FinalCta />
        </main>
        <ImmersiveFooter />
      </div>
    </GlobalEffects>
  );
}
