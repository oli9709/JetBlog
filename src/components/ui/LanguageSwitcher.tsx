'use client';

import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface LanguageSwitcherProps {
  value: 'all' | 'uz' | 'ru' | 'en';
  onChange: (lang: 'all' | 'uz' | 'ru' | 'en') => void;
  className?: string;
  includeAll?: boolean;
}

const LANGUAGES = [
  { id: 'uz', label: 'UZ' },
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
] as const;

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ value, onChange, className, includeAll }) => {
  const options = includeAll ? [{ id: 'all', label: 'BARCHASI' }, ...LANGUAGES] : LANGUAGES;
  const activeIndex = options.findIndex(lang => lang.id === value);

  return (
    <div 
      className={cn(
        "relative flex items-center p-1 bg-[#111111] rounded-full border border-[#222222] shadow-inner",
        className
      )}
    >
      {/* Sliding Indicator */}
      <div className="absolute inset-1 pointer-events-none">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ 
            width: `${100 / options.length}%`,
            transform: `translateX(${activeIndex * 100}%)`
          }}
        />
      </div>
      
      {options.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onChange(lang.id as any)}
          className={cn(
            "relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95",
            value === lang.id 
              ? "text-white" 
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
