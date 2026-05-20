'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Tier = {
  id: 'free' | 'job_seeker' | 'premium';
  name: string;
  price: string;
  description: string;
  buttonLabel: string;
  priceId?: string;
  featured?: boolean;
  badge?: string;
  features: string[];
};

interface PricingCardsProps {
  userId?: string;
  tiers: Tier[];
}

export default function PricingCards({ userId, tiers }: PricingCardsProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (tier: Tier) => {
    if (tier.id === 'free') return;

    if (!userId) {
      window.location.href = '/signup';
      return;
    }

    if (!tier.priceId) {
      setError('Stripe price ID is not configured yet.');
      return;
    }

    setLoadingTier(tier.id);
    setError(null);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.priceId,
          userId,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="mx-auto max-w-2xl rounded-card border border-red-500/30 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={
              tier.featured
                ? 'relative overflow-hidden border-transparent bg-purple-gradient text-white'
                : tier.id === 'premium'
                  ? 'border-2 border-primary/50 bg-white'
                  : 'border border-border bg-white'
            }
          >
            {tier.badge && (
              <div className="absolute right-5 top-5 rounded-pill bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                {tier.badge}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <h2
                  className={
                    tier.featured
                      ? 'text-2xl font-bold text-white'
                      : 'text-2xl font-bold text-text-primary'
                  }
                >
                  {tier.name}
                </h2>
                <p
                  className={
                    tier.featured
                      ? 'mt-2 text-sm text-white/80'
                      : 'mt-2 text-sm text-text-secondary'
                  }
                >
                  {tier.description}
                </p>
              </div>

              <p
                className={
                  tier.featured
                    ? 'text-5xl font-black text-white'
                    : 'text-5xl font-black text-text-primary'
                }
              >
                {tier.price}
              </p>

              {tier.id === 'free' ? (
                <Link
                  href={userId ? '/practice' : '/signup'}
                  className="inline-flex w-full items-center justify-center rounded-pill border border-primary bg-white px-6 py-3 text-base font-semibold text-primary transition-all duration-150 hover:bg-primary-light focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  {tier.buttonLabel}
                </Link>
              ) : (
                <Button
                  onClick={() => startCheckout(tier)}
                  loading={loadingTier === tier.id}
                  className={
                    tier.featured
                      ? 'w-full bg-white text-primary hover:bg-white/95'
                      : 'w-full'
                  }
                >
                  {tier.buttonLabel}
                </Button>
              )}

              <div className="space-y-3 pt-2">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex gap-3">
                    <span
                      className={
                        tier.featured
                          ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20'
                          : 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10'
                      }
                    >
                      <Check
                        className={
                          tier.featured ? 'h-3.5 w-3.5 text-white' : 'h-3.5 w-3.5 text-primary'
                        }
                      />
                    </span>
                    <span
                      className={
                        tier.featured
                          ? 'text-sm font-medium text-white/90'
                          : 'text-sm font-medium text-text-secondary'
                      }
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
