import PricingCards from '@/components/pricing/PricingCards';
import Logo from '@/components/ui/Logo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PricingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const tiers = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '$0',
      description: 'Start practicing with the essentials.',
      buttonLabel: 'Get Started',
      features: [
        '3 sessions limit',
        'Basic AI feedback',
        'Written practice only',
      ],
    },
    {
      id: 'job_seeker' as const,
      name: 'Job Seeker',
      price: '$19/month',
      description: 'For nurses actively preparing for interviews.',
      buttonLabel: 'Start Free Trial',
      priceId: process.env.STRIPE_JOB_SEEKER_PRICE_ID,
      featured: true,
      badge: 'Most Popular',
      features: [
        'Unlimited sessions',
        'Full AI coaching',
        'Written + Multiple choice',
        'Salary prep scripts',
        'Progress tracking',
      ],
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '$39/month',
      description: 'Advanced prep for competitive roles.',
      buttonLabel: 'Go Premium',
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      features: [
        'Everything in Job Seeker',
        'Voice practice mode (coming soon)',
        'Company research brief (coming soon)',
        'Priority support',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-page-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <Logo size="md" showText />
          <Link
            href={session ? '/dashboard' : '/login'}
            className="rounded-pill border border-primary/30 bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary-light"
          >
            {session ? 'Dashboard' : 'Sign in'}
          </Link>
        </div>

        <section className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Pricing
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black text-text-primary sm:text-5xl">
            Practice until your nursing interview answers feel natural.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Start free, then upgrade when you want unlimited AI coaching,
            progress tracking, and salary prep.
          </p>
        </section>

        <PricingCards userId={session?.user.id} tiers={tiers} />
      </div>
    </main>
  );
}
