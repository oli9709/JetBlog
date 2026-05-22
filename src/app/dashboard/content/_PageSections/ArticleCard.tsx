import React from 'react';
import { ExternalLink, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/helpers';

export interface ArticleT {
  id: string;
  title: string;
  status: 'draft' | 'scheduled' | 'published' | 'error';
  scheduled_for: string;
  published_at?: string;
  keyword: string;
  language: 'uz' | 'ru' | 'en';
  featured_image_url?: string;
  wp_post_id?: number;
}

interface ArticleCardProps {
  article: ArticleT;
  onSelect: (id: string) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export function ArticleCard({
  article,
  onSelect,
  onPublish,
  onDelete,
  isSelected,
}: ArticleCardProps) {
  // Tanlangan holat uchun class
  const selectedStyle = isSelected
    ? 'ring-2 ring-[#FB3640] shadow-[0_0_20px_rgba(251,54,64,0.2)] bg-[#111111]'
    : 'border-[#222222] hover:border-[#FB3640]/50 bg-black/40';

  return (
    <div
      onClick={() => onSelect(article.id)}
      className={cn(
        'group relative flex flex-col rounded-2xl border backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-300 transform',
        'hover:-translate-y-1 hover:shadow-2xl',
        selectedStyle
      )}
    >
      {/* Rasm mavjud bo'lsa */}
      {article.featured_image_url && (
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
        </div>
      )}

      {/* O'chirish tugmasi (Hoverda ko'rinadi) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(article.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/20"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Asosiy kontent */}
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Til va keyword */}
        <div className="flex items-center gap-2 mb-2">
          <div className="pointer-events-none scale-75 origin-left">
            <LanguageSwitcher value={article.language} onChange={() => {}} />
          </div>
          <span className="text-xs text-zinc-500 font-medium truncate">
            {article.keyword}
          </span>
        </div>

        {/* Sarlavha (Gradient Text) */}
        <h3 className="text-base font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent line-clamp-2 mb-4">
          {article.title || 'Sarlavhasiz maqola...'}
        </h3>

        <div className="mt-auto space-y-4">
          {/* Sanalar va tashqi link */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              {article.status === 'published' && article.published_at ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              <span>
                {article.status === 'published' && article.published_at
                  ? formatDate(article.published_at)
                  : formatDate(article.scheduled_for)}
              </span>
            </div>

            {article.wp_post_id && (
              <a
                href={`#wp-${article.wp_post_id}`} // Haqiqiy link ulanadi
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[#FF6B6B] hover:text-[#FF8A8F] transition-colors"
              >
                WP <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Status va Quick Action */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <StatusBadge status={article.status as any} />
            
            {article.status !== 'published' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(article.id);
                }}
                className="text-xs font-semibold text-white bg-[#FB3640]/20 hover:bg-[#FB3640]/30 px-3 py-1.5 rounded-lg transition-colors border border-[#FB3640]/20"
              >
                Nashr
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
