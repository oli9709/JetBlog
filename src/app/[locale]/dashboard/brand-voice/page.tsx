import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import BrandVoiceClient from './_PageSections/BrandVoiceClient';
import { getDashboardUserId } from '@/lib/API/Services/admin/dashboardUser';

export const metadata = {
  title: 'Brand Voice DNA - JetBlog.app',
  description: 'Biznesingiz uchun unikal brend ovozi va sun\'iy intellekt yozish uslubini yarating.',
};

export default async function BrandVoicePage() {
  const { userId, db } = await getDashboardUserId();
  

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Avtorizatsiya xatoligi</h2>
        <p className="text-gray-400 mt-2">Iltimos, tizimga qayta kiring.</p>
      </div>
    );
  }

  // 1. Foydalanuvchi bog'lagan saytlar ro'yxati
  let sites = [];
  try {
    const res = await GetSitesByUser(userId, db ?? undefined);
    if (res.data) {
      sites = res.data;
    }
  } catch (error) {
    console.error('Error fetching sites for brand voice:', error);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-6">
      <BrandVoiceClient initialSites={sites} userId={userId} />
    </div>
  );
}
