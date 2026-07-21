'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export interface UserRowData {
  id: string;
  email: string;
  plan: string;
  credits: number;
  subStatus: string;
  isSuspended: boolean;
  role: string;
}

interface Props {
  user: UserRowData;
  currentAdminRole: 'admin' | 'super_admin';
}

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export function UserActions({ user, currentAdminRole }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  // Modal state
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isTargetSuperAdmin = user.role === 'super_admin';
  const canDelete = currentAdminRole === 'super_admin' && !isTargetSuperAdmin;

  const doAction = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try {
      await fn();
      toast.success(`${label} done`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? label + ' failed');
    } finally {
      setBusy(null);
    }
  };

  const handleImpersonate = () =>
    doAction('View as', async () => {
      await postJSON('/api/admin/impersonate/start', { userId: user.id });
      window.location.href = '/dashboard/main';
    });

  const handleCancelSub = () =>
    doAction('Cancel subscription', () =>
      postJSON('/api/admin/subscription/cancel', { userId: user.id, reason: 'Admin action' })
    );

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <MiniBtn onClick={() => setCreditsOpen(true)} disabled={!!busy}>
        + Credits
      </MiniBtn>
      {user.subStatus === 'active' && (
        <MiniBtn onClick={handleCancelSub} disabled={!!busy} variant="warn">
          Cancel sub
        </MiniBtn>
      )}
      <MiniBtn onClick={() => setSuspendOpen(true)} disabled={!!busy || isTargetSuperAdmin} variant="warn">
        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
      </MiniBtn>
      <MiniBtn onClick={handleImpersonate} disabled={!!busy || isTargetSuperAdmin}>
        View as
      </MiniBtn>
      <MiniBtn onClick={() => setDeactivateOpen(true)} disabled={!!busy || isTargetSuperAdmin} variant="warn">
        Deactivate
      </MiniBtn>
      {canDelete && (
        <MiniBtn onClick={() => setDeleteOpen(true)} disabled={!!busy} variant="danger">
          Delete
        </MiniBtn>
      )}

      {creditsOpen && (
        <AddCreditsModal
          userEmail={user.email}
          userId={user.id}
          onClose={() => setCreditsOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
      {suspendOpen && (
        <SuspendModal
          userEmail={user.email}
          userId={user.id}
          currentlySuspended={user.isSuspended}
          onClose={() => setSuspendOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
      {deactivateOpen && (
        <DeactivateModal
          userEmail={user.email}
          userId={user.id}
          onClose={() => setDeactivateOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
      {deleteOpen && (
        <DeleteModal
          userEmail={user.email}
          userId={user.id}
          onClose={() => setDeleteOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}

function MiniBtn({
  children,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'warn' | 'danger';
}) {
  const cls =
    variant === 'danger'
      ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-rose-500/30'
      : variant === 'warn'
      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/25'
      : 'bg-white/5 text-white/80 hover:bg-white/10 border-white/10';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddCreditsModal({
  userEmail,
  userId,
  onClose,
  onDone,
}: {
  userEmail: string;
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState('30');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await postJSON('/api/admin/credits/add', {
        userId,
        amount: Number(amount),
        reason,
      });
      toast.success(`Added ${amount} credits`);
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell title={`Add credits to ${userEmail}`} onClose={onClose}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min={1}
        max={100000}
        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm"
      />
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required)"
        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm min-h-[80px]"
      />
      <button
        onClick={submit}
        disabled={busy || !reason.trim() || Number(amount) <= 0}
        className="w-full py-2 rounded-lg bg-[#FB3640] hover:bg-[#e02d37] text-white font-semibold text-sm disabled:opacity-50"
      >
        {busy ? 'Adding...' : 'Add credits'}
      </button>
    </ModalShell>
  );
}

function SuspendModal({
  userEmail,
  userId,
  currentlySuspended,
  onClose,
  onDone,
}: {
  userEmail: string;
  userId: string;
  currentlySuspended: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await postJSON('/api/admin/user/suspend', {
        userId,
        suspend: !currentlySuspended,
        reason: reason.trim() || undefined,
      });
      toast.success(currentlySuspended ? 'Unsuspended' : 'Suspended');
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell
      title={currentlySuspended ? `Unsuspend ${userEmail}` : `Suspend ${userEmail}`}
      onClose={onClose}
    >
      {!currentlySuspended && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required)"
          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm min-h-[80px]"
        />
      )}
      <button
        onClick={submit}
        disabled={busy || (!currentlySuspended && !reason.trim())}
        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm disabled:opacity-50"
      >
        {busy ? '...' : currentlySuspended ? 'Unsuspend' : 'Suspend'}
      </button>
    </ModalShell>
  );
}

function DeactivateModal({
  userEmail,
  userId,
  onClose,
  onDone,
}: {
  userEmail: string;
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await postJSON('/api/admin/user/deactivate', { userId, confirmEmail: confirm.trim() });
      toast.success('Deactivated');
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell title={`Deactivate ${userEmail}`} onClose={onClose}>
      <p className="text-xs text-white/60">
        Type the user email to confirm. Deactivation cancels their subscription and blocks
        dashboard access.
      </p>
      <input
        type="email"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={userEmail}
        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm"
      />
      <button
        onClick={submit}
        disabled={busy || confirm.trim().toLowerCase() !== userEmail.toLowerCase()}
        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm disabled:opacity-50"
      >
        {busy ? '...' : 'Deactivate'}
      </button>
    </ModalShell>
  );
}

function DeleteModal({
  userEmail,
  userId,
  onClose,
  onDone,
}: {
  userEmail: string;
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [confirm, setConfirm] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await postJSON('/api/admin/user/delete-permanently', {
        userId,
        confirmEmail: confirm.trim(),
        confirmText: confirmText.trim(),
      });
      toast.success('User permanently deleted');
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };
  const emailOk = confirm.trim().toLowerCase() === userEmail.toLowerCase();
  const textOk = confirmText.trim() === 'DELETE';
  return (
    <ModalShell title={`⚠ Permanently delete ${userEmail}`} onClose={onClose}>
      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 leading-relaxed">
        This will remove the auth user and cascade-delete all their sites, articles, and
        keywords. This action cannot be undone.
      </div>
      <input
        type="email"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={`Type email: ${userEmail}`}
        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm"
      />
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder='Type "DELETE" to confirm'
        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm"
      />
      <button
        onClick={submit}
        disabled={busy || !emailOk || !textOk}
        className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm disabled:opacity-50"
      >
        {busy ? '...' : 'Delete permanently'}
      </button>
    </ModalShell>
  );
}
