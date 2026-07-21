import ManageSubscription from '../_PageSections/Billing';
import { SubscriptionPlans } from '../_PageSections/SubscriptionPlans';
import { SupabaseUser } from '@/lib/API/Services/supabase/user';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { GetInvoicesByUser } from '@/lib/API/Database/invoices/queries';
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

  let invoices = [];
  try {
    const invoicesRes = await GetInvoicesByUser(user.id);
    if (invoicesRes.data) {
      invoices = invoicesRes.data;
    }
  } catch (error) {
    console.error('Error fetching user invoices:', error);
  }

  // Plan ID lar env dan (sandbox / live'ga qarab client.ts avtomatik tanlaydi).
  // Env yo'q bo'lsa bo'sh string — subscribe tugmasi "tarif sozlanmagan" ko'rsatadi.
  const starterPlanId = getPaypalPlanId('starter');
  const proPlanId = getPaypalPlanId('pro');

  return (
    <div className="space-y-6">
      <SubscriptionPlans starterPlanId={starterPlanId} proPlanId={proPlanId} />
      <ManageSubscription
        initialInvoices={invoices}
        userId={user.id}
        initialCredits={profile?.data?.[0]?.credits_remaining ?? 0}
      />
    </div>
  );
}
