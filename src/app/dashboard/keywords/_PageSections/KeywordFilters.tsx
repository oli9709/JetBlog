'use client';

import React from 'react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { cn } from '@/lib/utils/helpers';

interface KeywordFiltersProps {
  selectedLanguage: string;
  selectedStatus: string;
  onLanguageChange: (lang: string) => void;
  onStatusChange: (status: string) => void;
  totalCount: number;
  approvedCount: number;
}

const STATUSES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'pending', label: 'Navbatda' },
  { id: 'approved', label: 'Tasdiqlangan' },
  { id: 'published', label: 'Nashr qilingan' },
] as const;

export const KeywordFilters: React.FC<KeywordFiltersProps> = ({
  selectedLanguage,
  selectedStatus,
  onLanguageChange,
  onStatusChange,
  totalCount,
  approvedCount
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-4 shadow-xl">
      
      {/* Tillar filtri */}
      <div className="w-full lg:w-auto">
        <LanguageSwitcher 
          value={selectedLanguage as any} 
          onChange={onLanguageChange as any} 
          includeAll={true} 
          className="w-full lg:w-[300px]"
        />
      </div>

      {/* Status filtrlari */}
      <div className="flex items-center gap-1 p-1.5 bg-black/40 rounded-xl border border-[#222222] shadow-inner w-full lg:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {STATUSES.map((status) => {
          const isActive = selectedStatus === status.id;
          return (
            <button
              key={status.id}
              onClick={() => onStatusChange(status.id)}
              className={cn(
                "relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 outline-none whitespace-nowrap",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#FB3640] to-[#FB3640] rounded-lg shadow-[0_0_12px_rgba(251,54,64,0.2)] transition-all duration-500" />
              )}
              <span className="relative z-10">{status.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Tickers */}
      <div className="flex gap-6 items-center px-4 py-2 bg-black/30 rounded-full border border-white/5">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Jami</span>
          <span className="font-mono text-sm font-bold text-[#FF6B6B]">
            <NumberTicker value={totalCount} />
          </span>
        </div>
        <div className="w-px h-6 bg-[#222222]" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tasdiqlangan</span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            <NumberTicker value={approvedCount} />
          </span>
        </div>
      </div>
    </div>
  );
};
