import SideBar from './_PageSections/SideBar';
import Header from './_PageSections/Header';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { LayoutProps } from '@/lib/types/types';
import OnboardingGuard from './_PageSections/OnboardingGuard';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await SupabaseServerClient();

  // getUser() — server-side verified, cookie spoofing mumkin emas
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) redirect('/auth/login');

  const userId = user.id;

  const profile = await GetProfileByUserId(userId);

  // Faqat primitive qiymatlarni Client komponentga o'tkaz
  const display_name: string = profile?.data?.[0]?.display_name ?? '';
  const email: string = user.email ?? '';
  const avatar_url: string = (user.user_metadata?.avatar_url as string) ?? '';
  const onboarding_completed: boolean = profile?.data?.[0]?.onboarding_completed ?? false;

  return (
    <OnboardingGuard onboardingCompleted={onboarding_completed}>
      <main className="grid md:grid-cols-[auto_1fr]">
        <SideBar />
        <div>
          <Header email={email} display_name={display_name} avatar_url={avatar_url} />
          <div className="m-6">{children}</div>
        </div>
      </main>
    </OnboardingGuard>
  );
}
