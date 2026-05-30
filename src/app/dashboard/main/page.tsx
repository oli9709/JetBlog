import Dashboard from './_PageSections/Dashboard';
import { ActiveGenerationBanner } from '@/components/dashboard/ActiveGenerationBanner';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import { SupabaseServerClient as supabaseClient } from '@/lib/API/Services/init/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const client = await supabaseClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user?.id) {
    redirect('/auth/login');
  }

  const userId = user.id;

  const stats = {
    credits: 0,
    sitesCount: 0,
    totalArticles: 0,
    publishedArticles: 0
  };

  try {
    const [profile, sitesRes] = await Promise.all([
      GetProfileByUserId(userId),
      GetSitesByUser(userId)
    ]);

    stats.credits = profile?.data?.[0]?.credits_remaining ?? 0;

    const realSites = (sitesRes.data || []).filter(
      (s) => s.id !== '123e4567-e89b-12d3-a456-426614174000'
    );
    stats.sitesCount = realSites.length;

    if (realSites.length > 0) {
      const siteIds = realSites.map((s) => s.id);
      const [totalRes, publishedRes] = await Promise.all([
        client.from('articles').select('id', { count: 'exact', head: true }).in('site_id', siteIds),
        client
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .in('site_id', siteIds)
          .eq('status', 'published')
      ]);
      stats.totalArticles = totalRes.count ?? 0;
      stats.publishedArticles = publishedRes.count ?? 0;
    }
  } catch (e) {
    console.error('Dashboard stats fetch error:', e);
  }

  return (
    <div>
      <Dashboard stats={stats} />
      <ActiveGenerationBanner userId={userId} />
    </div>
  );
}
