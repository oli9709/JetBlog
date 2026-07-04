'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';
import { ArticleT } from '@/lib/types/supabase';

const ACTIVE_STATUSES: ArticleT['status'][] = ['queued', 'generating', 'imaging', 'publishing'];

const STATUS_LABELS: Partial<Record<ArticleT['status'], string>> = {
  queued:     'Navbatda kutmoqda...',
  generating: 'Matn yozilmoqda...',
  imaging:    'Rasm yaratilmoqda...',
  publishing: 'Saqlanmoqda...',
};

interface ActiveGenerationBannerProps {
  userId: string;
}

interface ActiveArticle {
  id: string;
  title: string;
  status: ArticleT['status'];
  site_id: string;
}

export function ActiveGenerationBanner({ userId }: ActiveGenerationBannerProps) {
  const supabase = createClientComponentClient();
  const [activeArticles, setActiveArticles] = useState<ActiveArticle[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial fetch
    supabase
      .from('articles')
      .select('id, title, status, site_id')
      .in('status', ACTIVE_STATUSES)
      .then(({ data }) => {
        if (data) setActiveArticles(data as ActiveArticle[]);
      });

    // Realtime: track all articles for this user's sites
    const channel = supabase
      .channel('active-generations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'articles' },
        (payload) => {
          const updated = payload.new as ActiveArticle;
          setActiveArticles((prev) => {
            const isActive = ACTIVE_STATUSES.includes(updated.status);
            const exists = prev.find((a) => a.id === updated.id);
            if (isActive) {
              return exists
                ? prev.map((a) => (a.id === updated.id ? updated : a))
                : [...prev, updated];
            }
            return prev.filter((a) => a.id !== updated.id);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const visible = activeArticles.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm">
      {visible.map((article) => (
        <div
          key={article.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border border-[#FB3640]/30',
            'bg-zinc-950/90 backdrop-blur-sm shadow-xl',
            'animate-in slide-in-from-bottom-2 duration-300'
          )}
        >
          <Loader2 className="w-4 h-4 text-[#FB3640] animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{article.title || 'Maqola'}</p>
            <p className="text-xs text-zinc-500">{STATUS_LABELS[article.status]}</p>
          </div>
          <Link
            href="/dashboard/content"
            className="text-xs text-[#FB3640] hover:underline shrink-0"
          >
            Ko'rish
          </Link>
          <button
            onClick={() => setDismissed((prev) => { const s = new Set(prev); s.add(article.id); return s; })}
            className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
            aria-label="Yopish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
