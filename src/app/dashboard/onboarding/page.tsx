import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
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

  // Agar allaqachon onboarding tugatilgan bo'lsa, dashboard ga qaytarvoramiz
  if (onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl">
        <OnboardingClient userId={user.id} />
      </div>
    </div>
  );
}
