import SideBar from './_PageSections/SideBar';
import Header from './_PageSections/Header';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { LayoutProps } from '@/lib/types/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await SupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect('/auth/login');

  const profile = await GetProfileByUserId(user.id);

  const display_name: string = profile?.data?.[0]?.display_name ?? '';
  const email: string = user.email ?? '';
  const avatar_url: string = (user.user_metadata?.avatar_url as string) ?? '';
  const onboarding_completed: boolean = profile?.data?.[0]?.onboarding_completed ?? false;

  // Server-side onboarding redirect — YAGONA joy
  const headersList = await headers();
  // x-invoke-path — Vercel da avtomatik set bo'ladi, localhost da bo'lishi mumkin emas.
  // pathname bo'sh bo'lsa redirect qilmaymiz — infinite loop oldini oladi.
  const pathname = headersList.get('x-invoke-path') ?? '';
  if (!onboarding_completed && pathname && !pathname.includes('onboarding')) {
    redirect('/dashboard/onboarding');
  }

  return (
    <main className="grid md:grid-cols-[auto_1fr]">
      <SideBar />
      <div>
        <Header email={email} display_name={display_name} avatar_url={avatar_url} />
        <div className="m-6">{children}</div>
      </div>
    </main>
  );
}
