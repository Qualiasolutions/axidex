import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Mapping of Stripe status to our subscription status
function mapStripeStatus(status: string): 'free' | 'active' | 'past_due' | 'canceled' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'free';
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'pro' | 'enterprise' | undefined;

  if (!userId || !tier) {
    console.error('Missing userId or tier in checkout session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Retrieve the full subscription details
  const stripe = getStripe();
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  // Extract subscription data from response
  const subscription = subscriptionResponse as unknown as {
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  // Update profile with subscription info
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_tier: tier,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Failed to update profile:', profileError);
    throw profileError;
  }

  // Insert subscription record for history
  const { error: subError } = await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    status: 'active',
    tier,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (subError) {
    console.error('Failed to create subscription record:', subError);
    // Don't throw - profile update succeeded
  }

  console.log(`Subscription activated for user ${userId}: ${tier}`);
}

// Type for subscription data we need
interface StripeSubscriptionData {
  id: string;
  status: string;
  customer: string;
  metadata?: { userId?: string; tier?: string };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

async function handleSubscriptionUpdated(
  rawSubscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  // Cast to our expected shape
  const subscription = rawSubscription as unknown as StripeSubscriptionData;

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  const status = mapStripeStatus(subscription.status);
  const tier = subscription.metadata?.tier as 'pro' | 'enterprise' | undefined;

  // Update profile
  const updateData: Record<string, unknown> = {
    subscription_status: status,
    subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  };

  if (tier) {
    updateData.subscription_tier = tier;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (profileError) {
    console.error('Failed to update profile:', profileError);
    throw profileError;
  }

  // Upsert subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status,
        tier: tier || 'pro',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      {
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false,
      }
    );

  if (subError) {
    console.error('Failed to upsert subscription record:', subError);
  }

  console.log(`Subscription updated for user ${userId}: status=${status}`);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by stripe_customer_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!profile) {
      console.error('Could not find user for deleted subscription');
      return;
    }

    // Reset subscription status
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_tier: 'free',
        stripe_subscription_id: null,
        subscription_period_end: null,
      })
      .eq('id', profile.id);

    console.log(`Subscription canceled for user ${profile.id}`);
    return;
  }

  // Reset to free tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
      stripe_subscription_id: null,
      subscription_period_end: null,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Failed to update profile:', profileError);
    throw profileError;
  }

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (subError) {
    console.error('Failed to update subscription record:', subError);
  }

  console.log(`Subscription deleted for user ${userId}`);
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = invoice.customer as string;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('Could not find user for failed invoice');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'past_due' })
    .eq('id', profile.id);

  if (error) {
    console.error('Failed to update profile to past_due:', error);
    throw error;
  }

  console.log(`Payment failed for user ${profile.id}`);
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  const customerId = invoice.customer as string;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('Could not find user for paid invoice');
    return;
  }

  // Only update if was past_due (recovery payment)
  if (profile.subscription_status === 'past_due') {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', profile.id);

    if (error) {
      console.error('Failed to update profile to active:', error);
      throw error;
    }

    console.log(`Payment recovered for user ${profile.id}`);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      case 'invoice.paid':
        await handleInvoicePaid(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
