import Dashboard from './_PageSections/Dashboard';
import { ActiveGenerationBanner } from '@/components/dashboard/ActiveGenerationBanner';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { GetSitesByUser } from '@/lib/API/Database/sites/queries';
import { SupabaseServerClient as supabaseClient } from '@/lib/API/Services/init/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export type ArticleRow = {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string | null;
  site_id: string | null;
  site_url?: string | null;
};

export default async function DashboardPage() {
  const client = await supabaseClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user?.id) redirect('/auth/login');
  const userId = user.id;

  // ─── Default values ───────────────────────────────────────────
  const stats = { credits: 0, activeSites: 0, totalArticles: 0, thisMonthPublished: 0 };
  let articlesByDay: { date: string; count: number }[] = [];
  let keywordStats = { approved: 0, pending: 0, rejected: 0 };
  let recentArticles: ArticleRow[] = [];

  try {
    const [profile, sitesRes] = await Promise.all([
      GetProfileByUserId(userId),
      GetSitesByUser(userId),
    ]);

    stats.credits = profile?.data?.[0]?.credits_remaining ?? 0;

    const allSites = sitesRes.data ?? [];
    const realSites = allSites.filter(
      (s) => s.id !== '123e4567-e89b-12d3-a456-426614174000'
    );
    const activeSites = realSites.filter((s) => s.is_active);
    stats.activeSites = activeSites.length;

    if (realSites.length > 0) {
      const siteIds = realSites.map((s) => s.id);

      // Date range: start of this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Date range: 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [totalRes, thisMonthRes, last30Res, kwRes, recentRes] = await Promise.all([
        // Total articles
        client
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .in('site_id', siteIds),

        // This month published
        client
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .in('site_id', siteIds)
          .gte('created_at', monthStart),

        // Last 30 days articles (for line chart)
        client
          .from('articles')
          .select('created_at')
          .in('site_id', siteIds)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true }),

        // Keywords status counts
        client
          .from('keywords')
          .select('status')
          .in('site_id', siteIds),

        // Recent 5 articles with site url
        client
          .from('articles')
          .select('id, title, status, created_at, site_id, sites(url)')
          .in('site_id', siteIds)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      stats.totalArticles = totalRes.count ?? 0;
      stats.thisMonthPublished = thisMonthRes.count ?? 0;

      // ─── Build articles-per-day map ─────────────────────────
      const dayMap: Record<string, number> = {};
      // Pre-fill last 30 days with 0
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = 0;
      }
      for (const row of last30Res.data ?? []) {
        if (row.created_at) {
          const key = row.created_at.slice(0, 10);
          if (key in dayMap) dayMap[key] = (dayMap[key] ?? 0) + 1;
        }
      }
      articlesByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

      // ─── Keyword stats ──────────────────────────────────────
      for (const kw of kwRes.data ?? []) {
        if (kw.status === 'approved') keywordStats.approved++;
        else if (kw.status === 'pending') keywordStats.pending++;
        else if (kw.status === 'rejected') keywordStats.rejected++;
      }

      // ─── Recent articles ────────────────────────────────────
      recentArticles = (recentRes.data ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        created_at: a.created_at,
        site_id: a.site_id,
        site_url: a.sites?.url ?? null,
      }));
    }
  } catch (e) {
    console.error('Dashboard stats fetch error:', e);
  }

  return (
    <div>
      <Dashboard
        stats={stats}
        articlesByDay={articlesByDay}
        keywordStats={keywordStats}
        recentArticles={recentArticles}
      />
      <ActiveGenerationBanner userId={userId} />
    </div>
  );
}
