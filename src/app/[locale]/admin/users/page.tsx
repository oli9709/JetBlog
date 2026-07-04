'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface AdminUser {
  id: string;
  email: string;
  plan: string;
  credits_remaining: number;
  is_admin: boolean;
  created_at: string;
  sites_count: number;
  articles_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditInput, setCreditInput] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/users').then(r => r.json());
    setUsers(res.users || []);
    setLoading(false);
  }

  async function addCredits(userId: string) {
    const credits = parseInt(creditInput[userId] || '0');
    if (!credits || credits <= 0) { toast.error('Musbat son kiriting'); return; }
    setActionId(userId);
    const res = await fetch('/api/admin/add-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, credits })
    }).then(r => r.json());
    setActionId(null);
    if (res.success) {
      toast.success(`✅ +${credits} kredit qo'shildi`);
      setCreditInput(p => ({ ...p, [userId]: '' }));
      fetchUsers();
    } else {
      toast.error(res.error);
    }
  }

  function planBadge(plan: string) {
    const colors: Record<string, string> = {
      FREE: 'text-white/40 bg-white/5',
      STARTER: 'text-blue-400 bg-blue-900/30',
      PRO: 'text-purple-400 bg-purple-900/30',
      AGENCY: 'text-yellow-400 bg-yellow-900/30'
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[plan] || colors.FREE}`}>
        {plan || 'FREE'}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <p className="text-white/40 text-sm mt-1">Jami: {users.length} ta</p>
      </div>

      {loading ? (
        <p className="text-white/30">Yuklanmoqda...</p>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/30 uppercase tracking-wide border-b border-white/5">
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Kreditlar</th>
                <th className="py-3 px-4">Saytlar</th>
                <th className="py-3 px-4">Maqolalar</th>
                <th className="py-3 px-4">Ro'yxat sanasi</th>
                <th className="py-3 px-4">Kredit qo'shish</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80">{u.email}</span>
                      {u.is_admin && <span className="text-xs bg-red-900/30 text-red-400 px-1.5 rounded">Admin</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">{planBadge(u.plan)}</td>
                  <td className="py-3 px-4 text-sm font-mono text-blue-400">{u.credits_remaining ?? 0}</td>
                  <td className="py-3 px-4 text-sm text-white/50">{u.sites_count}</td>
                  <td className="py-3 px-4 text-sm text-white/50">{u.articles_count}</td>
                  <td className="py-3 px-4 text-xs text-white/30">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('uz-UZ') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="10"
                        value={creditInput[u.id] || ''}
                        onChange={e => setCreditInput(p => ({ ...p, [u.id]: e.target.value }))}
                        className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => addCredits(u.id)}
                        disabled={actionId === u.id}
                        className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50 transition-colors"
                      >
                        {actionId === u.id ? '...' : '+'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
