import { createClient } from '@/lib/supabase/server';

export const TIER_LIMITS = {
  free: {
    signals_per_month: 50,
    automation_rules: 2,
    emails_per_day: 10,
    crm_integrations: 0,
    custom_sources: 0,
  },
  pro: {
    signals_per_month: -1, // unlimited
    automation_rules: 5,
    emails_per_day: 100,
    crm_integrations: 1,
    custom_sources: 0,
  },
  enterprise: {
    signals_per_month: -1, // unlimited
    automation_rules: -1, // unlimited
    emails_per_day: -1, // unlimited
    crm_integrations: -1, // unlimited
    custom_sources: 10,
  },
} as const;

export type TierLimit = keyof typeof TIER_LIMITS.free;
export type SubscriptionTier = keyof typeof TIER_LIMITS;

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single();

  // Only active subscriptions get tier benefits
  if (!data || data.subscription_status !== 'active') {
    return 'free';
  }

  return (data.subscription_tier as SubscriptionTier) || 'free';
}

export async function checkLimit(
  userId: string,
  limitType: TierLimit,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; tier: SubscriptionTier }> {
  const tier = await getUserTier(userId);
  const limit = TIER_LIMITS[tier][limitType];

  // -1 means unlimited
  const allowed = limit === -1 || currentUsage < limit;

  return { allowed, limit, tier };
}

export async function getUsageCount(
  userId: string,
  resource: 'signals' | 'rules' | 'emails'
): Promise<number> {
  const supabase = await createClient();

  if (resource === 'rules') {
    const { count } = await supabase
      .from('automation_rules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }

  if (resource === 'emails') {
    // Count emails created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('generated_emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());
    return count || 0;
  }

  if (resource === 'signals') {
    // Count signals this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());
    return count || 0;
  }

  return 0;
}
