'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { FAQItem } from '@/lib/constants/faq';

interface FAQSearchProps {
  onResults: (results: FAQItem[] | null) => void;
  allItems: FAQItem[];
}

export function FAQSearch({ onResults, allItems }: FAQSearchProps) {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      if (!q) {
        onResults(null);
        return;
      }
      const matches = allItems.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
      onResults(matches);
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, allItems, onResults]);

  const clear = () => {
    setQuery('');
    onResults(null);
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300',
          'bg-zinc-900/60 backdrop-blur-md',
          query
            ? 'border-[#FB3640]/50 shadow-[0_0_20px_rgba(251,54,64,0.1)]'
            : 'border-zinc-800 hover:border-zinc-700'
        )}
      >
        <Search
          className={cn(
            'w-5 h-5 shrink-0 transition-colors duration-200',
            query ? 'text-[#FB3640]' : 'text-zinc-500'
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Savol qidiring..."
          className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Tozalash"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
