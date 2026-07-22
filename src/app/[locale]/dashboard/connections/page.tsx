import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import ConnectionsClient from './_PageSections/ConnectionsClient';
import { getDashboardUserId } from '@/lib/API/Services/admin/dashboardUser';

export const metadata = {
  title: 'WordPress Connections - JetBlog.app',
  description: 'WordPress saytlaringizni bog\'lang va avtomatlashtirilgan AI SEO autopilotini sozlang.',
};

export default async function ConnectionsPage() {
  const { userId, db } = await getDashboardUserId();
  

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Avtorizatsiya xatoligi</h2>
        <p className="text-gray-400 mt-2">Iltimos, tizimga qayta kiring.</p>
      </div>
    );
  }

  // 2. Foydalanuvchiga tegishli bog'langan saytlar ro'yxatini olish
  let sites = [];
  try {
    const res = await GetSitesByUser(userId, db ?? undefined);
    if (res.data) {
      sites = res.data;
    }
  } catch (error) {
    console.error('Error fetching sites:', error);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-6">
      <ConnectionsClient initialSites={sites} userId={userId} />
    </div>
  );
}
