'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  targetEmail?: string;
}

export function ImpersonationBanner({ targetEmail }: Props) {
  const [busy, setBusy] = useState(false);
  const end = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/impersonate/end', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Impersonation ended');
      window.location.href = '/admin/users';
    } catch {
      toast.error('Failed to end session');
      setBusy(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-rose-600 text-white text-sm font-semibold px-4 py-2 flex items-center justify-center gap-3 shadow-lg">
      <span className="animate-pulse text-lg">🔴</span>
      <span>
        Viewing as <strong>{targetEmail ?? 'user'}</strong> — read-only impersonation session
      </span>
      <button
        onClick={end}
        disabled={busy}
        className="px-3 py-1 rounded-md bg-black/30 hover:bg-black/50 text-xs font-bold disabled:opacity-50"
      >
        {busy ? 'Ending...' : 'End session'}
      </button>
    </div>
  );
}
