import SideBar from './_PageSections/SideBar';
import Header from './_PageSections/Header';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { LayoutProps } from '@/lib/types/types';
import { getEffectiveUser } from '@/lib/API/Services/admin/impersonation';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { adminServiceClient } from '@/lib/API/Services/admin/guard';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await SupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect('/auth/login');

  // Real admin's profile — for role check (Admin button, onboarding is checked on real user)
  const realProfile = await GetProfileByUserId(user.id);
  const realProfileData = realProfile?.data?.[0];
  const onboarding_completed: boolean = realProfileData?.onboarding_completed ?? false;
  const role: string = (realProfileData as { role?: string } | undefined)?.role ?? 'user';

  // Effective user (impersonation-aware) — for the actual dashboard data
  const effective = await getEffectiveUser(user.id);
  let effProfileData = realProfileData;
  let effEmail: string = user.email ?? '';
  let effAvatarUrl: string = (user.user_metadata?.avatar_url as string) ?? '';

  if (effective.isImpersonating && effective.effectiveUserId !== user.id) {
    const svc = adminServiceClient();
    const [effProf, effAuth] = await Promise.all([
      svc.from('profiles').select('display_name, plan, credits_remaining').eq('id', effective.effectiveUserId).maybeSingle(),
      svc.auth.admin.getUserById(effective.effectiveUserId),
    ]);
    if (effProf.data) effProfileData = effProf.data as typeof realProfileData;
    if (effAuth.data?.user?.email) effEmail = effAuth.data.user.email;
    const meta = effAuth.data?.user?.user_metadata as { avatar_url?: string } | undefined;
    if (meta?.avatar_url) effAvatarUrl = meta.avatar_url;
  }

  const display_name: string = effProfileData?.display_name ?? '';
  const email: string = effEmail;
  const avatar_url: string = effAvatarUrl;
  const plan: string = effProfileData?.plan ?? 'FREE';
  const credits_remaining: number = effProfileData?.credits_remaining ?? 0;

  // Server-side onboarding redirect — YAGONA joy
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') ?? '';
  if (!onboarding_completed && pathname && !pathname.includes('onboarding')) {
    redirect('/dashboard/onboarding');
  }

  return (
    <>
      {effective.isImpersonating && <ImpersonationBanner targetEmail={effective.targetEmail} />}
      <main
        className={`grid md:grid-cols-[auto_1fr] ${effective.isImpersonating ? 'pt-10' : ''}`}
      >
        <SideBar />
        <div>
          <Header
            email={email}
            display_name={display_name}
            avatar_url={avatar_url}
            plan={plan}
            credits_remaining={credits_remaining}
            role={role}
          />
          <div className="m-6">{children}</div>
        </div>
      </main>
    </>
  );
}
