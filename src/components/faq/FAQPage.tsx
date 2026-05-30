'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { BookOpen, MessageCircle, ChevronDown } from 'lucide-react';
import { FAQ_CATEGORIES, getAllFAQItems, type FAQItem } from '@/lib/constants/faq';
import { FAQSearch } from './FAQSearch';
import { FAQCategory } from './FAQCategory';
import { cn } from '@/lib/utils/helpers';

function SearchResults({ results }: { results: FAQItem[] }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-4xl">🔍</div>
        <p className="text-zinc-400 text-sm">Hech narsa topilmadi</p>
        <Link
          href="/docs/quick-start"
          className="flex items-center gap-2 text-sm font-semibold text-[#FB3640] hover:underline"
        >
          <BookOpen className="w-4 h-4" />
          Javob topa olmadingizmi? Docs ga o&apos;ting →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {results.length} ta natija
        </span>
      </div>
      {results.map((item) => (
        <SearchResultItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function SearchResultItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-all duration-200',
          'hover:bg-zinc-900/40',
          open && 'border-l-2 border-[#FB3640] bg-[#FB3640]/5',
          !open && 'border-l-2 border-transparent'
        )}
      >
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white leading-snug">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-zinc-600 transition-all duration-300',
            open && 'rotate-180 text-[#FB3640]'
          )}
        />
      </button>
      {open && (
        <p className="px-5 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-l-2 border-[#FB3640]/30">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export function FAQPage() {
  const [searchResults, setSearchResults] = useState<FAQItem[] | null>(null);
  const allItems = getAllFAQItems();

  const handleResults = useCallback((results: FAQItem[] | null) => {
    setSearchResults(results);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FB3640]">
          Ko&apos;p beriladigan savollar
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          Savollar &amp;{' '}
          <span className="bg-gradient-to-r from-[#FB3640] to-rose-400 bg-clip-text text-transparent">
            Javoblar
          </span>
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
          JetBlog haqida eng ko&apos;p so&apos;raladigan savollarga javob toping.
          Kerakli savolni quyida qidiring yoki kategoriyadan tanlang.
        </p>
      </div>

      {/* Search */}
      <FAQSearch onResults={handleResults} allItems={allItems} />

      {/* Content: search results yoki kategoriyalar */}
      {searchResults !== null ? (
        <SearchResults results={searchResults} />
      ) : (
        <div className="flex flex-col gap-5">
          {FAQ_CATEGORIES.map((category, i) => (
            <FAQCategory
              key={category.id}
              category={category}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div>
          <p className="text-white font-semibold">Javob topa olmadingizmi?</p>
          <p className="text-zinc-400 text-sm mt-1">
            To&apos;liq qo&apos;llanma yoki support orqali yordam oling.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/docs/quick-start"
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              'bg-[#FB3640] text-white hover:bg-[#e02d37] hover:shadow-[0_0_20px_rgba(251,54,64,0.25)]'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Docs ga o&apos;tish
          </Link>
          <a
            href="https://t.me/jetblog_support"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              'border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Telegram support
          </a>
        </div>
      </div>
    </div>
  );
}
