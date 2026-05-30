'use client';

import React, { useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cn } from '@/lib/utils/helpers';
import { ArticleT } from '@/lib/types/supabase';
import { CheckCircle2, Loader2, AlertCircle, Circle } from 'lucide-react';

type GenerationStatus = ArticleT['status'];

interface Step {
  id: GenerationStatus;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'queued',     label: 'Navbatda',          description: 'Generatsiya boshlanishini kutmoqda...' },
  { id: 'generating', label: 'Matn yozilmoqda',   description: 'Claude AI maqola yaratmoqda (~45 soniya)' },
  { id: 'imaging',    label: 'Rasm yaratilmoqda',  description: "DALL-E 3 muqova rasm generatsiya qilmoqda" },
  { id: 'publishing', label: 'Saqlanmoqda',        description: "Maqola bazaga saqlanmoqda" },
];

const STATUS_ORDER: GenerationStatus[] = ['queued', 'generating', 'imaging', 'publishing', 'published', 'failed'];

function getStepState(stepId: GenerationStatus, currentStatus: GenerationStatus): 'done' | 'active' | 'error' | 'idle' {
  if (currentStatus === 'failed') {
    const currentIdx = STATUS_ORDER.indexOf(currentStatus);
    const stepIdx = STATUS_ORDER.indexOf(stepId);
    if (stepIdx < currentIdx - 1) return 'done';
    if (stepIdx === currentIdx - 1) return 'error';
    return 'idle';
  }
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepId);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'idle';
}

interface GenerationProgressProps {
  articleId: string;
  onComplete: (article: ArticleT) => void;
  onError: (error: string) => void;
}

export function GenerationProgress({ articleId, onComplete, onError }: GenerationProgressProps) {
  const supabase = createClientComponentClient();
  const [status, setStatus] = React.useState<GenerationStatus>('queued');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`article-progress-${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'articles',
          filter: `id=eq.${articleId}`,
        },
        (payload) => {
          const updated = payload.new as ArticleT;
          setStatus(updated.status);
          if (updated.status === 'published' || updated.status === 'draft') {
            onComplete(updated);
          } else if (updated.status === 'failed') {
            onError(updated.generation_error ?? 'Generatsiyada xatolik yuz berdi.');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId, supabase, onComplete, onError]);

  const displaySteps = STEPS.filter(s => s.id !== 'failed' && s.id !== 'published');

  return (
    <div className="w-full max-w-sm mx-auto py-4">
      <ol className="relative space-y-0">
        {displaySteps.map((step, i) => {
          const state = getStepState(step.id, status);
          const isLast = i === displaySteps.length - 1;

          return (
            <li key={step.id} className="flex gap-4">
              {/* Icon + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border',
                    state === 'done'   && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
                    state === 'active' && 'bg-[#FB3640]/20 border-[#FB3640] text-[#FB3640]',
                    state === 'error'  && 'bg-red-500/20 border-red-500 text-red-400',
                    state === 'idle'   && 'bg-zinc-900 border-zinc-800 text-zinc-600',
                  )}
                >
                  {state === 'done'   && <CheckCircle2 className="w-4 h-4" />}
                  {state === 'active' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {state === 'error'  && <AlertCircle className="w-4 h-4" />}
                  {state === 'idle'   && <Circle className="w-4 h-4" />}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-px flex-1 mt-1 mb-1 transition-colors duration-500',
                      state === 'done' ? 'bg-emerald-500/40' : 'bg-zinc-800'
                    )}
                    style={{ minHeight: '28px' }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="pb-6 pt-1">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors duration-300',
                    state === 'done'   && 'text-emerald-400',
                    state === 'active' && 'text-white',
                    state === 'error'  && 'text-red-400',
                    state === 'idle'   && 'text-zinc-600',
                  )}
                >
                  {step.label}
                </p>
                {state === 'active' && (
                  <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {status === 'failed' && (
        <p className="text-sm text-red-400 text-center mt-2">
          Generatsiyada xatolik yuz berdi. Qayta urinib ko&apos;ring.
        </p>
      )}
    </div>
  );
}
