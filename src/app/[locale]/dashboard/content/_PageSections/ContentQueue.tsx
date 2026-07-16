import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard, ArticleT } from './ArticleCard';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { cn } from '@/lib/utils/helpers';
import { useTranslations } from 'next-intl';

interface ContentQueueProps {
  articles: ArticleT[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function ContentQueue({
  articles,
  selectedId,
  onSelect,
  onPublish,
  onDelete,
  isLoading,
}: ContentQueueProps) {
  const t = useTranslations('Dashboard.contentQueue');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const TABS = [
    { id: 'all', label: t('tabAll') },
    { id: 'draft', label: t('tabDraft') },
    { id: 'scheduled', label: t('tabScheduled') },
    { id: 'published', label: t('tabPublished') },
    { id: 'error', label: t('tabError') },
  ];

  // Filtrlar
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || article.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const total = articles.length;
  const published = articles.filter(a => a.status === 'published').length;
  const scheduled = articles.filter(a => a.status === 'scheduled').length;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-[#222222] shadow-xl overflow-hidden">
      {/* Yuqori Header Qismi */}
      <div className="p-5 border-b border-[#222222] bg-[#111111]/80 backdrop-blur-xl shrink-0">
        <h2 className="text-xl font-bold text-white mb-4">{t('queueTitle')}</h2>

        {/* Stats */}
        <div className="flex gap-4 text-xs font-semibold mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span>{t('statTotal')}:</span>
            <NumberTicker value={total} className="text-white font-bold" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FB3640]/10 border border-[#FB3640]/20 text-[#FF6B6B]">
            <span>{t('statInQueue')}:</span>
            <NumberTicker value={scheduled} className="text-white font-bold" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span>{t('statPublished')}:</span>
            <NumberTicker value={published} className="text-white font-bold" />
          </div>
        </div>

        {/* Qidiruv Input */}
        <div className="relative mb-4 group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 transition-colors group-focus-within:text-[#FF6B6B] z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-[#222222] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FB3640] focus:border-[#FB3640] transition-all shadow-inner relative z-20"
          />
          {/* Fake Animated Placeholder */}
          {!searchQuery && (
            <div className="absolute left-9 top-2.5 pointer-events-none z-10 opacity-50">
              <TypingAnimation duration={100} className="text-sm text-zinc-400 font-normal">{t('searchPlaceholder')}</TypingAnimation>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative pb-2 text-sm font-medium transition-colors whitespace-nowrap outline-none",
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FB3640] to-[#FB3640] rounded-t-full shadow-[0_-2px_10px_rgba(251,54,64,0.2)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Maqolalar Ro'yxati (Scrollable) */}
      <div className="flex-1 p-5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#FB3640]/20 hover:[&::-webkit-scrollbar-thumb]:bg-[#FB3640]/40 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
        
        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 w-full rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          // Maqolalar
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={onSelect}
                onPublish={onPublish}
                onDelete={onDelete}
                isSelected={selectedId === article.id}
              />
            ))}
          </div>
        ) : (
          // Bo'sh Holat
          <div className="flex flex-col items-center justify-center h-full text-center p-6 mt-10">
            <div className="w-16 h-16 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center mb-4 shadow-xl">
              <Search className="h-6 w-6 text-zinc-500" />
            </div>
            <TypingAnimation duration={50} className="text-lg font-bold text-zinc-300 mb-2">{t('emptyState')}</TypingAnimation>
          </div>
        )}
      </div>
    </div>
  );
}
