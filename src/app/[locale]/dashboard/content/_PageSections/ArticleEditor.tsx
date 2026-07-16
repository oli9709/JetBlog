import React, { useState, useEffect } from 'react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { CheckCircle2, Rocket, Save, Edit3, Loader2 } from 'lucide-react';
import { ArticleT } from './ArticleCard';
import { TipTapEditor } from '@/components/ui/TipTapEditor';
import { cn } from '@/lib/utils/helpers';
import { useTranslations } from 'next-intl';

interface ArticleEditorProps {
  article: ArticleT | null;
  onSave: (id: string, title: string, content: string) => void;
  onPublishNow: (id: string) => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export function ArticleEditor({
  article,
  onSave,
  onPublishNow,
  isSaving,
  isPublishing,
}: ArticleEditorProps) {
  const t = useTranslations('Dashboard.contentQueue');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Maqola o'zgarganda state ni yangilash
  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      // Backend dan kelgan HTML content ni editorga yuklash
      setContent(article.content || '');
      setLastSaved(new Date());
    }
  }, [article?.id]);

  const handleSave = () => {
    if (article) {
      onSave(article.id, title, content);
      setLastSaved(new Date());
    }
  };

  const handlePublish = () => {
    if (article) {
      onPublishNow(article.id);
    }
  };

  if (!article) {
    return (
      <div className="flex flex-col h-full bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-[#222222] shadow-xl overflow-hidden items-center justify-center p-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#FB3640]/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-[#0a0a0a] border border-[#222222] h-24 w-24 rounded-full flex items-center justify-center shadow-2xl">
            <Edit3 className="h-10 w-10 text-[#FB3640]" />
          </div>
        </div>
        <TypingAnimation
          duration={50}
          className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-2"
        >{t('editorNoSelection')}</TypingAnimation>
        <p className="text-zinc-500 text-center max-w-sm">
          {t('editorNoSelectionDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-[#222222] shadow-2xl overflow-hidden relative">
      
      {/* Top Header / Auto-save indicator */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-md transition-opacity">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-green-400">
          {isSaving ? t('savingLabel') : t('savedIndicator')}
        </span>
      </div>

      {/* Editor Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#222222] hover:[&::-webkit-scrollbar-thumb]:bg-[#333333] [&::-webkit-scrollbar-thumb]:rounded-full pb-28">
        
        {/* Title Input */}
        <div className="p-8 pb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-transparent placeholder:bg-clip-text placeholder:bg-gradient-to-r placeholder:from-zinc-600 placeholder:to-zinc-800 focus:outline-none border-none ring-0 leading-tight"
          />
        </div>

        {/* TipTap Editor wrapper */}
        <div className="px-8 pb-8 editor-wrapper">
          <TipTapEditor content={content} onChange={setContent} />
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none">
        <div className="flex items-center justify-between bg-[#111111]/90 backdrop-blur-xl border border-[#222222] rounded-xl p-3 shadow-2xl pointer-events-auto">
          
          {/* Last saved */}
          <div className="flex items-center gap-2 pl-2">
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-medium">
              {t('lastSaved')}: {lastSaved ? lastSaved.toLocaleTimeString() : t('justNow')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('saveBtn')}
            </button>

            <ShimmerButton
              onClick={handlePublish}
              className={cn(
                "shadow-2xl px-6 py-2 h-auto text-sm font-bold flex items-center gap-2",
                article.status === 'published' ? 'opacity-50 cursor-not-allowed' : ''
              )}
              background={article.status === 'published' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'}
              disabled={isPublishing || article.status === 'published'}
            >
              {isPublishing ? (
                <Rocket className="h-4 w-4 animate-bounce" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              <span className="whitespace-nowrap z-10 relative">
                {article.status === 'published' ? t('alreadyPublished') : t('publishNowBtn')}
              </span>
            </ShimmerButton>
          </div>

        </div>
      </div>

    </div>
  );
}
