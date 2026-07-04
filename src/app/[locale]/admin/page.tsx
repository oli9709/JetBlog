import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [users, invoices, articles] = await Promise.all([
    supabase.from('profiles').select('id, plan, credits_remaining', { count: 'exact' }),
    supabase.from('invoices').select('status, amount_usd, created_at'),
    supabase.from('articles').select('id', { count: 'exact' }).eq('status', 'published')
  ]);

  const totalUsers = users.count ?? 0;
  const allInvoices = invoices.data ?? [];
  const pendingInvoices = allInvoices.filter(i => i.status === 'pending').length;
  const paidInvoices = allInvoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount_usd || 0), 0);
  const now = new Date();
  const thisMonthRevenue = paidInvoices
    .filter(i => {
      const d = new Date(i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, i) => sum + (i.amount_usd || 0), 0);

  const activeSubs = (users.data ?? []).filter(u => u.plan && u.plan !== 'FREE').length;

  return {
    totalUsers,
    activeSubs,
    pendingInvoices,
    thisMonthRevenue,
    totalRevenue,
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
        <StatCard label="Faol obunalar" value={stats.activeSubs} sub="FREE emas" accent="text-blue-400" />
        <StatCard
          label="Pending invoicelar"
          value={stats.pendingInvoices}
          sub="Tasdiqlash kutilmoqda"
          accent={stats.pendingInvoices > 0 ? 'text-yellow-400' : 'text-white'}
        />
        <StatCard
          label="Bu oy daromad"
          value={`$${stats.thisMonthRevenue.toFixed(2)}`}
          accent="text-green-400"
        />
        <StatCard
          label="Jami daromad"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          accent="text-green-300"
        />
        <StatCard label="Nashr qilingan maqolalar" value={stats.publishedArticles} />
      </div>

      {stats.pendingInvoices > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div>
            <p className="text-yellow-400 font-medium text-sm">
              {stats.pendingInvoices} ta invoice tasdiqlash kutilmoqda
            </p>
            <a href="/admin/invoices" className="text-yellow-400/70 text-xs hover:text-yellow-400 underline">
              Invoices sahifasiga o&apos;ting →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
