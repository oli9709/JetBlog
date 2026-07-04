import ManageSubscription from '../_PageSections/Billing';
import { SupabaseUser } from '@/lib/API/Services/supabase/user';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { GetInvoicesByUser } from '@/lib/API/Database/invoices/queries';
import { redirect } from 'next/navigation';
import config from '@/lib/config/auth';

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

  return (
    <div>
      <ManageSubscription
        initialInvoices={invoices}
        userId={user.id}
        initialCredits={profile?.data?.[0]?.credits_remaining ?? 0}
      />
    </div>
  );
}
