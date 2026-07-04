'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { cn } from '@/lib/utils/helpers';

interface KeywordFormProps {
  onSubmit: (keyword: string, language: string) => Promise<void>;
  isLoading: boolean;
  siteId: string;
}

const HINTS = [
  "Masalan: toshkentda stomatolog...",
  "Yoki: best dentist in tashkent...",
  "Masalan: sun'iy intellekt xizmatlari..."
];

export const KeywordForm: React.FC<KeywordFormProps> = ({ onSubmit, isLoading, siteId }) => {
  const [keyword, setKeyword] = useState('');
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>('uz');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Rotating hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % HINTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || siteId === 'default') return;

    try {
      await onSubmit(keyword.trim(), language);
      setIsSuccess(true);
      setKeyword('');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group"
    >
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FB3640]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#FB3640]" /> Yangi Kalit So'z
        </h2>
        <p className="text-sm text-zinc-500">Oyiga qancha qidirilishi va qiyinchilik darajasini AI tahlil qiladi</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Floating Label Input */}
        <div className="relative z-10 group/input">
          <input
            type="text"
            id="keyword"
            required
            placeholder=" "
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="peer block w-full px-4 pt-5 pb-2 bg-black/40 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-0 transition-all duration-300 placeholder-transparent"
          />
          {/* Animated gradient border on focus */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FB3640] to-[#FB3640] opacity-0 peer-focus:opacity-100 transition-opacity duration-500 -z-10 blur-[1px]" style={{ padding: '1px' }}>
             <div className="w-full h-full bg-black/90 rounded-xl" />
          </div>
          <div className="absolute inset-0 rounded-xl border border-zinc-800 peer-focus:border-transparent pointer-events-none transition-colors duration-300" />
          
          <label 
            htmlFor="keyword"
            className="absolute text-sm text-zinc-500 duration-300 transform -translate-y-3.5 scale-75 top-4 z-20 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 peer-focus:text-[#FF6B6B] pointer-events-none"
          >
            Kalit so'zni kiriting
          </label>
        </div>

        {/* Tillarni tanlash */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-3 pl-1">Kontent tili</label>
          <LanguageSwitcher 
            value={language} 
            onChange={(val) => setLanguage(val as any)} 
            className="h-12 text-sm"
          />
        </div>
      </div>

      {/* Shimmer Button Submit */}
      <div className="mt-2 z-10">
        <ShimmerButton 
          className="w-full h-12"
          background={isSuccess ? "#10b981" : "#4f46e5"}
          shimmerColor={isSuccess ? "#34d399" : "#818cf8"}
          shimmerSize="0.1em"
          disabled={isLoading || !keyword.trim() || siteId === 'default'}
        >
          <span className="text-white font-bold tracking-wide flex items-center justify-center gap-2 z-10">
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Tahlil qilinmoqda...</>
            ) : isSuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> Tahlil yakunlandi!</>
            ) : (
              "Qo'shish & Tahlil"
            )}
          </span>
        </ShimmerButton>
      </div>

      {/* Hint Text using TypingAnimation */}
      <div className="h-6 flex items-center justify-center mt-2 z-10">
        {!keyword && (
          <TypingAnimation
            key={hintIndex}
            className="text-xs text-zinc-500 italic font-normal"
            duration={40}
          >{HINTS[hintIndex]}</TypingAnimation>
        )}
      </div>
    </form>
  );
};
