import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

type CheckoutBody = {
  priceId?: string;
  userId?: string;
};

function getPlanForPrice(priceId: string) {
  if (priceId === process.env.STRIPE_JOB_SEEKER_PRICE_ID) return 'job_seeker';
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, userId } = (await request.json()) as CheckoutBody;

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'priceId and userId are required' },
        { status: 400 }
      );
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('Secret key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Job seeker price ID:', process.env.STRIPE_JOB_SEEKER_PRICE_ID);
    console.log('Premium price ID:', process.env.STRIPE_PREMIUM_PRICE_ID);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('Requested checkout price ID:', priceId);

    const plan = getPlanForPrice(priceId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL is not set' },
        { status: 500 }
      );
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
          userId: session.user.id,
          plan,
        },
        subscription_data: {
          metadata: {
            userId: session.user.id,
            plan,
          },
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
      const stripeError = error as {
        message?: string;
        type?: string;
        code?: string;
      };
      console.error('Stripe error:', stripeError.message);
      console.error('Stripe error type:', stripeError.type);
      console.error('Stripe error code:', stripeError.code);
      return NextResponse.json(
        { error: stripeError.message || 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
