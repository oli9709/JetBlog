import { notFound } from 'next/navigation';
import { adminServiceClient, requireSuperAdmin } from '@/lib/API/Services/admin/guard';
import { TeamAddForm } from '../_components/TeamAddForm';
import { TeamRemoveBtn } from '../_components/TeamRemoveBtn';

export const dynamic = 'force-dynamic';

interface AdminRow {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  updated_at?: string;
}

interface AuditRow {
  id: string;
  admin_email: string;
  action: string;
  target_user_email?: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

async function loadTeam(): Promise<{ admins: AdminRow[]; logs: AuditRow[] }> {
  const svc = adminServiceClient();
  const [profilesRes, logsRes, authListRes] = await Promise.all([
    svc.from('profiles').select('id, role').in('role', ['admin', 'super_admin']),
    svc
      .from('admin_audit_log')
      .select('id, admin_email, action, target_user_email, details, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    svc.auth.admin.listUsers({ perPage: 1000, page: 1 }),
  ]);

  const emailMap: Record<string, string> = {};
  (authListRes.data?.users as Array<{ id: string; email?: string }> | undefined)?.forEach((u) => {
    if (u.email) emailMap[u.id] = u.email;
  });

  const admins: AdminRow[] = (profilesRes.data ?? []).map((p) => ({
    id: p.id,
    email: emailMap[p.id] ?? '(no email)',
    role: p.role as 'admin' | 'super_admin',
  }));

  const logs: AuditRow[] = (logsRes.data ?? []) as AuditRow[];

  return { admins, logs };
}

export default async function AdminTeamPage() {
  const admin = await requireSuperAdmin();
  if (!admin) notFound();

  const { admins, logs } = await loadTeam();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-white/40 text-sm mt-1">Manage admin roles and view audit log.</p>
      </div>

      {/* Current admins */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Current admins</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/40 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white/90">{a.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        a.role === 'super_admin'
                          ? 'bg-[#FB3640]/15 text-[#FF6B6B] border-[#FB3640]/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.role === 'super_admin' || a.id === admin.id ? (
                      <span className="text-xs text-white/30">—</span>
                    ) : (
                      <TeamRemoveBtn userId={a.id} email={a.email} />
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-white/40">
                    No admins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add new admin */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Add new admin</h2>
        <p className="text-xs text-white/40">
          Search by email. Super admin can only be added via SQL directly.
        </p>
        <div className="max-w-md">
          <TeamAddForm />
        </div>
      </section>

      {/* Audit log */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Audit log (last 50)</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/40 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-medium">When</th>
                <th className="text-left px-4 py-2 font-medium">Admin</th>
                <th className="text-left px-4 py-2 font-medium">Action</th>
                <th className="text-left px-4 py-2 font-medium">Target</th>
                <th className="text-left px-4 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 align-top">
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{l.admin_email}</td>
                  <td className="px-4 py-3">
                    <code className="text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-blue-300">
                      {l.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs">{l.target_user_email ?? '—'}</td>
                  <td className="px-4 py-3">
                    {l.details ? (
                      <details className="text-white/50">
                        <summary className="text-[11px] cursor-pointer hover:text-white/80">view</summary>
                        <pre className="text-[10px] mt-2 p-2 bg-black/40 rounded overflow-x-auto max-w-md">
                          {JSON.stringify(l.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                    No admin actions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
