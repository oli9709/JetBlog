import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import ContentClient from './_PageSections/ContentClient';
import { SupabaseSession } from '@/lib/API/Services/supabase/user';

export const metadata = {
  title: 'Content Queue & Editor - JetBlog.app',
  description: 'AI SEO maqolalar navbatini ko\'ring, tahrirlang va WordPress-ga nashr qiling.',
};

export default async function ContentPage() {
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

  // 1. Bog'langan saytlar ro'yxatini olish
  let sites = [];
  try {
    const res = await GetSitesByUser(session.user.id);
    if (res.data) {
      sites = res.data;
    }
  } catch (error) {
    console.error('Error fetching sites for content queue:', error);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-6">
      <ContentClient initialSites={sites} userId={session.user.id} />
    </div>
  );
}
