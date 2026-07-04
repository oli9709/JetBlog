import { SupabaseSession } from '@/lib/API/Services/supabase/user';
import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import KeywordsClient from './_PageSections/KeywordsClient';

export const metadata = {
  title: 'Keywords Autopilot - JetBlog.app',
  description: 'Kalit so\'zlarni tahlil qiling, qo\'shing va AI SEO maqolalar navbatini shakllantiring.',
};

export default async function KeywordsPage() {
  const { data } = await SupabaseSession();
  const session = data?.session;

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Avtorizatsiya xatoligi</h2>
        <p className="text-gray-400 mt-2">Iltimos, tizimga qayta kiring.</p>
      </div>
    );
  }

  // 1. Foydalanuvchiga tegishli bog'langan saytlar ro'yxatini olish
  let sites = [];
  try {
    const res = await GetSitesByUser(session.user.id);
    if (res.data) {
      sites = res.data;
    }
  } catch (error) {
    console.error('Error fetching sites for keywords:', error);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-6">
      <KeywordsClient initialSites={sites} userId={session.user.id} />
    </div>
  );
}
