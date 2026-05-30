'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const SUGGESTIONS = [
  "WordPress SEO 2026 qo'llanma",
  "Sun'iy intellekt kelajagi",
  "Sog'lom ovqatlanish sirlari",
];

type Language = 'uz' | 'ru' | 'en';

interface StepKeywordProps {
  onComplete: (keyword: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

const LOADING_TEXTS = [
  '✍️ Claude AI maqola yozmoqda...',
  '📸 DALL-E 3 muqova rasm yaratmoqda...',
  '📤 Saytingizga yuborilmoqda...',
];

export function StepKeyword({ onComplete, onBack, onSkip }: StepKeywordProps) {
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState<Language>('uz');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= LOADING_TEXTS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    // 9 soniyadan so'ng tugaydi (demo — real da API chaqiriladi)
    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      onComplete(keyword.trim());
    }, 9000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-8 w-full">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-[#FB3640]/30 border-t-[#FB3640] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#FB3640] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg animate-pulse">
            {LOADING_TEXTS[loadingStep]}
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Bu 30–90 soniya olishi mumkin
          </p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-2">
          {LOADING_TEXTS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-500',
                i <= loadingStep ? 'bg-[#FB3640] scale-125' : 'bg-zinc-800'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Birinchi maqolani yarating
      </h2>
      <p className="text-zinc-400 text-sm text-center mb-8">
        Kalit so&apos;z kiriting — Claude AI maqolani yozib, saytingizga publish qiladi.
      </p>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setKeyword(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
              'border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50',
              keyword === s && 'border-[#FB3640]/40 text-[#FB3640] bg-[#FB3640]/8'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input + language */}
      <div className="w-full space-y-3 mb-8">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-zinc-400">Kalit so&apos;z yoki sarlavha</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#FB3640]/50"
          >
            <option value="uz">O&apos;zbek (UZ)</option>
            <option value="ru">Русский (RU)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Masalan: WordPress SEO 2026 qo'llanma"
          className={cn(
            'w-full px-4 py-3.5 rounded-xl text-white text-sm',
            'bg-zinc-900/60 border border-zinc-800',
            'focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640]',
            'placeholder:text-zinc-600 transition-all duration-300'
          )}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Orqaga
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-zinc-600 hover:text-zinc-400 underline underline-offset-4 decoration-zinc-700 transition-colors"
          >
            O&apos;tkazib yuborish
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!keyword.trim()}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-300',
              'bg-gradient-to-r from-[#FB3640] to-rose-500',
              'hover:shadow-[0_0_24px_rgba(251,54,64,0.3)] hover:scale-[1.02] active:scale-95',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100'
            )}
          >
            🚀 Maqola Yaratish
          </button>
        </div>
      </div>
    </div>
  );
}
