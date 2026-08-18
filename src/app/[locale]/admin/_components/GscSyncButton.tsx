'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Zap } from 'lucide-react';

interface Result {
  ok: boolean;
  sites_processed: number;
  total_added: number;
  total_skipped: number;
  per_site?: Array<{ siteId: string; added: number; skipped: number; reason?: string; error?: string }>;
}

export function GscSyncButton() {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<Result | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/gsc-sync', { method: 'POST' });
      const json = (await res.json()) as Result & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setLast(json);
      toast.success(
        `GSC sync: +${json.total_added} keywords across ${json.sites_processed} sites`
      );
    } catch (err: any) {
      toast.error(err?.message ?? 'GSC sync failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FB3640]" />
            GSC Keyword Sync
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Manually run Search Console keyword discovery for all active sites.
            Runs weekly on cron; this button triggers it immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#FB3640] hover:bg-[#e02d37] text-white disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? 'Running…' : 'Run now'}
        </button>
      </div>

      {last && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1 text-xs">
          <p className="text-white/70">
            <span className="text-emerald-400 font-semibold">{last.total_added}</span> added ·{' '}
            <span className="text-white/50">{last.total_skipped}</span> skipped ·{' '}
            <span className="text-white/50">{last.sites_processed} sites</span>
          </p>
          {last.per_site && last.per_site.length > 0 && (
            <details className="mt-2">
              <summary className="text-white/40 cursor-pointer hover:text-white/70">
                per-site breakdown
              </summary>
              <pre className="mt-2 p-2 rounded bg-black/40 text-[10px] text-white/60 overflow-x-auto max-h-40">
                {JSON.stringify(last.per_site, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
