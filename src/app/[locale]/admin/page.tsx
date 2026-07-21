import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [users, articles] = await Promise.all([
    supabase.from('profiles').select('id, plan, credits_remaining, subscription_status, subscription_plan', { count: 'exact' }),
    supabase.from('articles').select('id', { count: 'exact' }).eq('status', 'published')
  ]);

  const totalUsers = users.count ?? 0;
  const activeSubs = (users.data ?? []).filter(u => u.subscription_status === 'active').length;
  const starterSubs = (users.data ?? []).filter(u => u.subscription_status === 'active' && u.subscription_plan === 'starter').length;
  const proSubs = (users.data ?? []).filter(u => u.subscription_status === 'active' && u.subscription_plan === 'pro').length;
  // Baholovchi MRR — actual to'lovlar PayPal tomonda, bu faqat approx
  const monthlyMRR = starterSubs * 9 + proSubs * 29;

  return {
    totalUsers,
    activeSubs,
    starterSubs,
    proSubs,
    monthlyMRR,
    publishedArticles: articles.count ?? 0
  };
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-white/40 text-sm mt-1">JetBlog.ai — boshqaruv paneli</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Jami foydalanuvchilar" value={stats.totalUsers} />
        <StatCard label="Faol obunalar" value={stats.activeSubs} sub={`${stats.starterSubs} Starter · ${stats.proSubs} Pro`} accent="text-blue-400" />
        <StatCard
          label="MRR (oylik daromad)"
          value={`$${stats.monthlyMRR.toFixed(2)}`}
          sub="PayPal Subscriptions"
          accent="text-green-400"
        />
        <StatCard label="Nashr qilingan maqolalar" value={stats.publishedArticles} />
      </div>
    </div>
  );
}
