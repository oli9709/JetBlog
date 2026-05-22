'use client';

import React from 'react';
import { Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { cn } from '@/lib/utils/helpers';

interface KeywordT {
  id: string;
  keyword: string;
  language: 'uz' | 'ru' | 'en';
  search_volume: number;
  difficulty: number;
  status: 'pending' | 'approved' | 'generated' | 'published';
  article_id?: string;
}

interface KeywordTableProps {
  keywords: KeywordT[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onViewArticle: (articleId: string) => void;
}

export const KeywordTable: React.FC<KeywordTableProps> = ({ keywords, onApprove, onDelete, onViewArticle }) => {
  if (keywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-[#222222] min-h-[300px]">
        <TypingAnimation
          className="text-lg font-medium text-zinc-400"
          duration={50}
        >Birinchi kalit so&apos;zingizni qo&apos;shing...</TypingAnimation>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {keywords.map((kw) => {
        // Qiyinchilik darajasi
        let diffColor = "bg-emerald-500";
        let diffText = "Oson";
        if (kw.difficulty > 35 && kw.difficulty <= 65) {
          diffColor = "bg-yellow-500";
          diffText = "O'rtacha";
        } else if (kw.difficulty > 65) {
          diffColor = "bg-rose-500";
          diffText = "Qiyin";
        }

        // StatusBadge formatlashi (bizda 'draft' | 'scheduled' | 'published' | 'error' mavjud edi, 
        // yangi formatga moslaymiz. O'xshash variantlarni tanlaymiz)
        let mappedStatus: 'draft' | 'scheduled' | 'published' | 'error' = 'draft';
        if (kw.status === 'pending') mappedStatus = 'draft';
        if (kw.status === 'approved' || kw.status === 'generated') mappedStatus = 'scheduled';
        if (kw.status === 'published') mappedStatus = 'published';

        return (
          <div 
            key={kw.id} 
            className="group relative flex flex-col justify-between p-6 bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-15px_rgba(251,54,64,0.2)] overflow-hidden"
          >
            {/* Glow Hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-[#FB3640]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

            {/* Sarlavha qismi */}
            <div className="flex justify-between items-start mb-6 z-10">
              <h3 className="font-bold text-lg text-white max-w-[70%] leading-tight truncate" title={kw.keyword}>
                {kw.keyword}
              </h3>
              <span className="uppercase text-[10px] font-black tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-md text-zinc-400">
                {kw.language}
              </span>
            </div>

            {/* Statistika */}
            <div className="space-y-4 mb-6 z-10 flex-grow">
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                <span className="text-xs text-zinc-500 font-medium">Qidiruv hajmi</span>
                <span className="font-mono text-[#FF6B6B] font-bold">
                  <NumberTicker value={kw.search_volume} />
                </span>
              </div>

              <div className="space-y-2 bg-black/40 px-3 py-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">SEO Qiyinchilik</span>
                  <span className="font-bold text-zinc-300">{kw.difficulty} <span className="font-medium text-[10px] opacity-70">({diffText})</span></span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000 ease-out", diffColor)}
                    style={{ width: `${kw.difficulty}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 z-10">
              <StatusBadge status={mappedStatus} />
              
              <div className="flex gap-2">
                {kw.status === 'pending' && (
                  <ShimmerButton 
                    className="shadow-2xl" 
                    background="rgba(16, 185, 129, 0.1)" 
                    shimmerColor="#34d399" 
                    onClick={() => onApprove(kw.id)}
                    shimmerSize="0.05em"
                    borderRadius="10px"
                  >
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 px-3 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlash
                    </span>
                  </ShimmerButton>
                )}

                {kw.article_id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-xl border-white/10 hover:border-[#FB3640]/50 hover:bg-[#FB3640]/10 text-xs text-zinc-400 hover:text-[#FF6B6B] transition-all duration-300"
                    onClick={() => onViewArticle(kw.article_id!)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> O'qish
                  </Button>
                )}

                <button 
                  onClick={() => onDelete(kw.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
