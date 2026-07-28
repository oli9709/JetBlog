'use client';

import { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/helpers';

interface Props {
  articleId: string;
  initialUrl: string | null | undefined;
  onChange: (newUrl: string | null) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export function CoverImageEditor({ articleId, initialUrl, onChange }: Props) {
  const t = useTranslations('Dashboard.contentQueue');
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [progress, setProgress] = useState<number | null>(null); // 0..100 during upload
  const [busy, setBusy] = useState(false);

  // XHR upload for real progress feedback (fetch has no upload progress).
  const uploadWithProgress = (file: File): Promise<{ url?: string; error?: string }> => {
    return new Promise((resolve) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('articleId', articleId);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload/cover-image');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve({ url: json.url });
          else resolve({ error: json.error ?? `HTTP ${xhr.status}` });
        } catch {
          resolve({ error: `HTTP ${xhr.status}` });
        }
      };
      xhr.onerror = () => resolve({ error: 'Network error' });
      xhr.send(fd);
    });
  };

  const pickFile = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    // Client-side validation (server also enforces)
    if (file.size > MAX_SIZE) {
      toast.error(t('fileTooLarge'));
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast.error(t('invalidFormat'));
      return;
    }

    setBusy(true);
    setProgress(0);
    const result = await uploadWithProgress(file);
    setBusy(false);
    setProgress(null);

    if (result.error || !result.url) {
      toast.error(t('uploadError', { message: result.error ?? 'unknown' }));
      return;
    }
    setUrl(result.url);
    onChange(result.url);
    toast.success(t('uploadSuccess'));
  };

  const handleRemove = async () => {
    if (!confirm(t('removeConfirm'))) return;
    setBusy(true);
    try {
      const res = await fetch('/api/upload/cover-image/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed');
      setUrl(null);
      onChange(null);
      toast.success(t('uploadSuccess'));
    } catch (err: any) {
      toast.error(t('uploadError', { message: err?.message ?? 'unknown' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {t('coverImage')}
        </label>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = ''; // reset so re-selecting same file re-triggers
        }}
      />

      {url ? (
        // ── State: image present ──────────────────────────────────
        <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          {busy && progress !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#FB3640]" />
              <p className="text-xs text-white">{t('uploading')} {progress}%</p>
              <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FB3640] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={pickFile}
              disabled={busy}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                'bg-black/70 hover:bg-black/90 text-white backdrop-blur border border-white/10',
                'disabled:opacity-50'
              )}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('replaceCover')}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 backdrop-blur border border-rose-500/30',
                'disabled:opacity-50'
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('removeCover')}
            </button>
          </div>
        </div>
      ) : (
        // ── State: no image ───────────────────────────────────────
        <button
          type="button"
          onClick={pickFile}
          disabled={busy}
          className={cn(
            'group relative flex aspect-video w-full flex-col items-center justify-center gap-2',
            'rounded-xl border-2 border-dashed border-white/15 bg-white/5',
            'hover:border-[#FB3640]/40 hover:bg-[#FB3640]/5 transition-all',
            'disabled:opacity-50'
          )}
        >
          {busy && progress !== null ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#FB3640]" />
              <p className="text-sm text-zinc-300">{t('uploading')} {progress}%</p>
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FB3640] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-white/5 border border-white/10 p-3 group-hover:bg-[#FB3640]/10 group-hover:border-[#FB3640]/30 transition-colors">
                <ImagePlus className="h-6 w-6 text-zinc-400 group-hover:text-[#FB3640]" />
              </div>
              <p className="text-sm font-semibold text-zinc-200">{t('uploadCover')}</p>
              <p className="text-xs text-zinc-500">{t('uploadHint')}</p>
            </>
          )}
        </button>
      )}
    </div>
  );
}
