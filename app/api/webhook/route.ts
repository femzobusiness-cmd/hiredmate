import { getStripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getPlanForPrice(priceId: string | null | undefined) {
  if (priceId === process.env.STRIPE_JOB_SEEKER_PRICE_ID) return 'job_seeker';
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  return 'free';
}

function getPlanFromSubscription(subscription: Stripe.Subscription) {
  const metadataPlan = subscription.metadata?.plan;
  if (metadataPlan === 'job_seeker' || metadataPlan === 'premium') {
    return metadataPlan;
  }

  const priceId = subscription.items.data[0]?.price.id;
  return getPlanForPrice(priceId);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = headers().get('stripe-signature')!;

  console.log('Stripe webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  console.log('Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Session metadata:', session.metadata);
        const userId = session.metadata?.userId;
        if (userId) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id;
          const plan =
            session.metadata?.plan === 'job_seeker' || session.metadata?.plan === 'premium'
              ? session.metadata.plan
              : 'job_seeker';

          const updatePayload = {
            plan,
            stripe_customer_id:
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id || null,
            stripe_subscription_id: subscriptionId || null,
            updated_at: new Date().toISOString(),
          };

          const { data: updatedProfiles, error: updateError } = await supabase
            .from('user_profiles')
            .update(updatePayload)
            .eq('user_id', userId)
            .select('id, user_id, plan');

          if (updateError) throw updateError;

          if (!updatedProfiles?.length) {
            const { error: idFallbackError } = await supabase
              .from('user_profiles')
              .update(updatePayload)
              .eq('id', userId);

            if (idFallbackError) throw idFallbackError;
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const plan = subscription.status === 'active' || subscription.status === 'trialing'
          ? getPlanFromSubscription(subscription)
          : 'free';

        if (userId) {
          await supabase
            .from('user_profiles')
            .update({
              plan,
              stripe_customer_id:
                typeof subscription.customer === 'string'
                  ? subscription.customer
                  : subscription.customer.id,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('user_profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
