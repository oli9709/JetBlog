import SideBar from './_PageSections/SideBar';
import Header from './_PageSections/Header';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { LayoutProps } from '@/lib/types/types';
import { getEffectiveUser } from '@/lib/API/Services/admin/impersonation';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await SupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect('/auth/login');

  const profile = await GetProfileByUserId(user.id);
  const profileData = profile?.data?.[0];

  const display_name: string = profileData?.display_name ?? '';
  const email: string = user.email ?? '';
  const avatar_url: string = (user.user_metadata?.avatar_url as string) ?? '';
  const onboarding_completed: boolean = profileData?.onboarding_completed ?? false;
  const plan: string = profileData?.plan ?? 'FREE';
  const credits_remaining: number = profileData?.credits_remaining ?? 0;
  const role: string = (profileData as { role?: string } | undefined)?.role ?? 'user';

  // Server-side onboarding redirect — YAGONA joy
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') ?? '';
  if (!onboarding_completed && pathname && !pathname.includes('onboarding')) {
    redirect('/dashboard/onboarding');
  }

  const effective = await getEffectiveUser(user.id);

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
