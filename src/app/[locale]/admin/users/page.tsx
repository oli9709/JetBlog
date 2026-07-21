import Link from 'next/link';
import { adminServiceClient, requireAdmin } from '@/lib/API/Services/admin/guard';
import { UserActions, type UserRowData } from '../_components/UserActions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type FilterKey = 'all' | 'free' | 'starter' | 'pro' | 'suspended' | 'cancelled';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'cancelled', label: 'Cancelled' },
];

interface Props {
  searchParams: Promise<{ filter?: string; q?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { filter = 'all', q = '', page = '1' } = await searchParams;
  const admin = (await requireAdmin())!; // middleware guaranteed
  const svc = adminServiceClient();

  // 1. Query profiles (NOTE: profiles jadvalida created_at yo'q — auth.users'дан olamiz)
  let query = svc
    .from('profiles')
    .select(
      'id, credits_remaining, subscription_status, subscription_plan, is_suspended, role',
      { count: 'exact' }
    );

  switch (filter) {
    case 'starter':
      query = query.eq('subscription_plan', 'starter').eq('subscription_status', 'active');
      break;
    case 'pro':
      query = query.eq('subscription_plan', 'pro').eq('subscription_status', 'active');
      break;
    case 'free':
      query = query.or('subscription_status.is.null,subscription_status.eq.none');
      break;
    case 'suspended':
      query = query.eq('is_suspended', true);
      break;
    case 'cancelled':
      query = query.eq('subscription_status', 'cancelled');
      break;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: profiles, count, error: queryErr } = await query.range(from, to);
  if (queryErr) {
    console.error('[admin/users] query failed', queryErr.message);
  }

  // 2. Emails
  const ids = new Set((profiles ?? []).map((p) => p.id));
  const emailMap: Record<string, string> = {};
  const createdMap: Record<string, string> = {};
  if (ids.size > 0) {
    const { data: authList } = await svc.auth.admin.listUsers({ perPage: 1000, page: 1 });
    (authList?.users as Array<{ id: string; email?: string; created_at?: string }> | undefined)?.forEach((u) => {
      if (ids.has(u.id)) {
        if (u.email) emailMap[u.id] = u.email;
        createdMap[u.id] = u.created_at ?? '';
      }
    });
  }

  const rows: UserRowData[] = (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: emailMap[p.id] ?? '(no email)',
      plan:
        p.subscription_status === 'active' && p.subscription_plan
          ? p.subscription_plan
          : p.subscription_status === 'cancelled'
          ? 'cancelled'
          : 'free',
      credits: p.credits_remaining ?? 0,
      subStatus: p.subscription_status ?? 'none',
      isSuspended: !!p.is_suspended,
      role: p.role ?? 'user',
    }))
    .filter((r) => (q ? r.email.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => {
      // Sort by signup date (from auth.users), newest first
      const ta = createdMap[a.id] ? new Date(createdMap[a.id]).getTime() : 0;
      const tb = createdMap[b.id] ? new Date(createdMap[b.id]).getTime() : 0;
      return tb - ta;
    });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-white/40 text-sm mt-1">
          Total: {count ?? 0} · Page {pageNum} of {totalPages}
        </p>
      </div>

      {/* Filters + search (server-side via query params) */}
      <form className="flex flex-wrap gap-2 items-center">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={{ pathname: '/admin/users', query: { filter: f.key, q } }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.key
                ? 'bg-[#FB3640] text-white border-[#FB3640]'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            {f.label}
          </Link>
        ))}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search email..."
          className="ml-auto px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <input type="hidden" name="filter" value={filter} />
        <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/40 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Email</th>
              <th className="text-left px-4 py-2 font-medium">Plan</th>
              <th className="text-right px-4 py-2 font-medium">Credits</th>
              <th className="text-left px-4 py-2 font-medium">Signup</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-right px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="text-white/90 truncate max-w-[220px]">{r.email}</div>
                  {r.role !== 'user' && (
                    <span className="text-[9px] font-bold uppercase text-[#FB3640]">{r.role}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70 capitalize">{r.plan}</td>
                <td className="px-4 py-3 text-right text-amber-300 font-semibold">
                  {r.credits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {createdMap[r.id] ? new Date(createdMap[r.id]).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {r.isSuspended ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      SUSPENDED
                    </span>
                  ) : r.subStatus === 'active' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                      {r.subStatus.toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActions user={r} currentAdminRole={admin.role} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  No users match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).slice(0, 20).map((_, i) => {
            const p = i + 1;
            return (
              <Link
                key={p}
                href={{ pathname: '/admin/users', query: { filter, q, page: p } }}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  pageNum === p
                    ? 'bg-[#FB3640] text-white border-[#FB3640]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
