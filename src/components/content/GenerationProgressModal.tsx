'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GenerationProgress } from './GenerationProgress';
import { ArticleT } from '@/lib/types/supabase';
import { Sparkles } from 'lucide-react';

interface GenerationProgressModalProps {
  open: boolean;
  articleId: string;
  onComplete: (article: ArticleT) => void;
  onError: (error: string) => void;
}

export function GenerationProgressModal({ open, articleId, onComplete, onError }: GenerationProgressModalProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-8 focus:outline-none"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FB3640]/10 border border-[#FB3640]/25 flex items-center justify-center text-[#FB3640] mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <Dialog.Title className="text-xl font-bold text-white">
              Maqola yaratilmoqda
            </Dialog.Title>
            <Dialog.Description className="text-sm text-zinc-500 mt-1">
              Iltimos kuting — bu 1-2 daqiqa olishi mumkin
            </Dialog.Description>
          </div>

          <GenerationProgress
            articleId={articleId}
            onComplete={onComplete}
            onError={onError}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
