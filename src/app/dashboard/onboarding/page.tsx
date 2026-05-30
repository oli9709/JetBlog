import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect('/auth/login');
  }

  const profile = await GetProfileByUserId(user.id);
  const onboarding_completed = profile?.data?.[0]?.onboarding_completed;

  if (onboarding_completed) {
    redirect('/dashboard/main');
  }

  // Agar foydalanuvchi allaqachon sayt ulagan bo'lsa — platform va connect bosqichini o'tkazib yuborib, keyword bosqichidan boshlaymiz
  const sitesRes = await GetSitesByUser(user.id);
  const hasSites = (sitesRes.data?.length ?? 0) > 0;
  const initialStep: 1 | 3 = hasSites ? 3 : 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-2xl">
        <OnboardingClient userId={user.id} initialStep={initialStep} />
      </div>
    </div>
  );
}
