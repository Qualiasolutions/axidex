import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars are not set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For convenience, also export a stripe getter that's the same
export const stripe = {
  get instance() {
    return getStripe();
  }
};

// Plan definitions - price IDs set via environment variables
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '10 signals per month',
      '1 automation rule',
      'Email generation',
      'Basic support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    features: [
      'Unlimited signals',
      '5 automation rules',
      'Email notifications',
      'Slack integration',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    features: [
      'Everything in Pro',
      'Unlimited automation rules',
      'CRM integrations',
      'Custom signal sources',
      'Dedicated support',
      'Custom onboarding',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
