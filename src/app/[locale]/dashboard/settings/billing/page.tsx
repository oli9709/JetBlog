import ManageSubscription from '../_PageSections/Billing';
import { SubscriptionPlans } from '../_PageSections/SubscriptionPlans';
import { SupabaseUser } from '@/lib/API/Services/supabase/user';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import config from '@/lib/config/auth';
import { getPaypalPlanId } from '@/lib/API/Services/paypal/client';

export const dynamic = 'force-dynamic';

export default async function Billing() {
  let user: Awaited<ReturnType<typeof SupabaseUser>>;
  try {
    user = await SupabaseUser();
    if (!user?.id) redirect(config.redirects.requireAuth);
  } catch {
    redirect(config.redirects.requireAuth);
  }
  const profile = await GetProfileByUserId(user.id);

  // Plan ID lar env dan (sandbox / live'ga qarab client.ts avtomatik tanlaydi).
  const starterPlanId = getPaypalPlanId('starter');
  const proPlanId = getPaypalPlanId('pro');

  return (
    <div className="space-y-6">
      <SubscriptionPlans starterPlanId={starterPlanId} proPlanId={proPlanId} />
      <ManageSubscription
        initialCredits={profile?.data?.[0]?.credits_remaining ?? 0}
      />
    </div>
  );
}
