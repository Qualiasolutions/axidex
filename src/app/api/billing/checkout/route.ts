import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, PLANS, PlanKey } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { tier } = await request.json() as { tier: PlanKey };

    // Validate tier
    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const plan = PLANS[tier];
    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this tier' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user profile with existing stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let stripeCustomerId = profile.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!stripeCustomerId) {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: user.email!,
          name: profile.full_name || undefined,
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = newCustomer.id;
      }

      // Save stripe_customer_id to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
      metadata: {
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
