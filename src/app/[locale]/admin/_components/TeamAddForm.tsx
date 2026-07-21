'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface FoundUser {
  id: string;
  email: string;
  role: string;
}

export function TeamAddForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<FoundUser | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setBusy(true);
    setSearched(true);
    setFound(null);
    try {
      const res = await fetch(`/api/admin/user/search?email=${encodeURIComponent(email.trim())}`);
      const json = await res.json();
      setFound(json.user ?? null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Search failed');
    } finally {
      setBusy(false);
    }
  };

  const makeAdmin = async () => {
    if (!found) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/team/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: found.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      toast.success('Admin added');
      setEmail('');
      setFound(null);
      setSearched(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm"
        />
        <button
          onClick={search}
          disabled={busy || email.trim().length < 3}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {searched && !found && !busy && (
        <p className="text-xs text-white/40">No user found with this email.</p>
      )}

      {found && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div>
            <div className="text-sm text-white">{found.email}</div>
            <div className="text-[10px] uppercase text-white/40">Role: {found.role}</div>
          </div>
          {found.role === 'user' ? (
            <button
              onClick={makeAdmin}
              disabled={busy}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FB3640] hover:bg-[#e02d37] text-white disabled:opacity-50"
            >
              Make admin
            </button>
          ) : (
            <span className="text-xs text-white/40">Already {found.role}</span>
          )}
        </div>
      )}
    </div>
  );
}
