import { adminServiceClient } from '@/lib/API/Services/admin/guard';

export const dynamic = 'force-dynamic';

interface Metrics {
  totalUsers: number;
  newThisMonth: number;
  starterSubs: number;
  proSubs: number;
  articlesThisMonth: number;
  mrrUsd: number;
  paymentsThisMonth: number;
}

interface FailureRow {
  id: string;
  title?: string | null;
  error_message?: string | null;
  created_at: string;
  user_email: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  plan: string;
  user_email: string;
  created_at: string;
}

async function loadData(): Promise<{
  metrics: Metrics;
  failures: FailureRow[];
  payments: PaymentRow[];
}> {
  const svc = adminServiceClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthISO = startOfMonth.toISOString();
  const dayAgoISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [users, articlesMonth, failures, payments] = await Promise.all([
    svc.from('profiles').select('id, subscription_status, subscription_plan, created_at'),
    svc.from('articles').select('id', { count: 'exact' }).gte('created_at', startOfMonthISO),
    svc
      .from('articles')
      .select('id, title, error_message, created_at, site_id, sites(user_id)')
      .eq('status', 'error')
      .gte('created_at', dayAgoISO)
      .order('created_at', { ascending: false })
      .limit(20),
    svc
      .from('paypal_webhook_events')
      .select('id, event_type, user_id, payload, created_at:processed_at')
      .in('event_type', ['PAYMENT.SALE.COMPLETED', 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED'])
      .order('processed_at', { ascending: false })
      .limit(20),
  ]);

  const profiles = users.data ?? [];
  const active = profiles.filter((p) => p.subscription_status === 'active');
  const starterSubs = active.filter((p) => p.subscription_plan === 'starter').length;
  const proSubs = active.filter((p) => p.subscription_plan === 'pro').length;
  const newThisMonth = profiles.filter(
    (p) => p.created_at && new Date(p.created_at) >= startOfMonth
  ).length;

  // Enrich failure rows + payment rows with email
  const userIds = new Set<string>();
  const failuresRaw = failures.data ?? [];
  const paymentsRaw = payments.data ?? [];
  failuresRaw.forEach((f: any) => {
    const uid = f.sites?.user_id;
    if (uid) userIds.add(uid);
  });
  paymentsRaw.forEach((p: any) => p.user_id && userIds.add(p.user_id));

  const emailMap: Record<string, string> = {};
  if (userIds.size > 0) {
    const { data: authList } = await svc.auth.admin.listUsers({ perPage: 1000, page: 1 });
    authList?.users.forEach((u) => {
      if (u.email && userIds.has(u.id)) emailMap[u.id] = u.email;
    });
  }

  const failureRows: FailureRow[] = failuresRaw.map((f: any) => ({
    id: f.id,
    title: f.title,
    error_message: f.error_message,
    created_at: f.created_at,
    user_email: emailMap[f.sites?.user_id ?? ''] ?? '—',
  }));

  const paymentRows: PaymentRow[] = paymentsRaw.map((p: any) => {
    const amount = Number(p.payload?.resource?.amount?.total ?? p.payload?.resource?.amount?.value ?? 0);
    const plan = p.payload?.resource?.plan_id ? 'subscription' : 'payment';
    return {
      id: p.id,
      amount,
      plan,
      user_email: emailMap[p.user_id ?? ''] ?? '—',
      created_at: p.created_at,
    };
  });

  const paymentsThisMonthCount = paymentsRaw.filter(
    (p: any) => p.created_at && new Date(p.created_at) >= startOfMonth
  ).length;

  const metrics: Metrics = {
    totalUsers: profiles.length,
    newThisMonth,
    starterSubs,
    proSubs,
    articlesThisMonth: articlesMonth.count ?? 0,
    mrrUsd: starterSubs * 9 + proSubs * 29,
    paymentsThisMonth: paymentsThisMonthCount,
  };

  return { metrics, failures: failureRows, payments: paymentRows };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminOverviewPage() {
  const { metrics, failures, payments } = await loadData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-white/40 text-sm mt-1">JetBlog admin — live metrics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Total users" value={metrics.totalUsers} sub={`+${metrics.newThisMonth} this month`} />
        <MetricCard
          label="Active subscriptions"
          value={metrics.starterSubs + metrics.proSubs}
          sub={`${metrics.starterSubs} Starter · ${metrics.proSubs} Pro`}
          accent="text-blue-400"
        />
        <MetricCard label="Articles this month" value={metrics.articlesThisMonth} accent="text-white" />
        <MetricCard label="MRR (est.)" value={`$${metrics.mrrUsd.toFixed(2)}`} accent="text-green-400" />
        <MetricCard label="Payments this month" value={metrics.paymentsThisMonth} accent="text-emerald-300" />
      </div>

      {/* Recent failures */}
      <section>
        <h2 className="text-lg font-bold mb-3">Recent failures (last 24h)</h2>
        {failures.length === 0 ? (
          <p className="text-sm text-white/40">No failures — nice.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">User</th>
                  <th className="text-left px-4 py-2 font-medium">Article</th>
                  <th className="text-left px-4 py-2 font-medium">Error</th>
                  <th className="text-right px-4 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {failures.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white/80">{f.user_email}</td>
                    <td className="px-4 py-3 text-white/60 truncate max-w-[240px]">{f.title ?? '—'}</td>
                    <td className="px-4 py-3 text-rose-300 text-xs truncate max-w-[280px]">
                      {f.error_message ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-white/40 text-xs">{timeAgo(f.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent payments */}
      <section>
        <h2 className="text-lg font-bold mb-3">Recent payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-white/40">No PayPal payments yet.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">User</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-right px-4 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white/80">{p.user_email}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{p.plan}</td>
                    <td className="px-4 py-3 text-right text-white/40 text-xs">{timeAgo(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}
