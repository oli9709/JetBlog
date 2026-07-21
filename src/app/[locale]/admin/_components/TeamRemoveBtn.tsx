'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export function TeamRemoveBtn({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!confirm(`Remove admin rights from ${email}?`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/team/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      toast.success('Removed');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={remove}
      disabled={busy}
      className="text-[10px] font-semibold px-2 py-1 rounded-md border bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-rose-500/30 disabled:opacity-40"
    >
      Remove
    </button>
  );
}
