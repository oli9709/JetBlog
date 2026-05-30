'use client';

import React from 'react';
import { Globe, Ghost, Layers, Webhook } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { PlatformType } from '@/components/connections/PlatformSelector';

interface Platform {
  id: PlatformType;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const PLATFORMS: Platform[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Eng mashhur CMS — REST API orqali publish',
    icon: <Globe className="w-6 h-6" />,
  },
  {
    id: 'ghost',
    name: 'Ghost CMS',
    description: 'AI saytlar uchun ideal — Admin API bilan',
    icon: <Ghost className="w-6 h-6" />,
    popular: true,
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'No-code builder — CMS Collection ga publish',
    icon: <Layers className="w-6 h-6" />,
  },
  {
    id: 'webhook',
    name: 'Custom sayt',
    description: 'Webhook orqali har qanday platforma',
    icon: <Webhook className="w-6 h-6" />,
  },
];

interface StepPlatformProps {
  selected: PlatformType | null;
  onSelect: (platform: PlatformType) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepPlatform({ selected, onSelect, onNext, onSkip }: StepPlatformProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center">
        Platformangizni tanlang
      </h2>
      <p className="text-zinc-400 text-sm text-center mb-8 max-w-md">
        Qaysi platforma bilan ulanmoqchisiz? Keyinchalik ham qo&apos;shish mumkin.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-10">
        {PLATFORMS.map((platform) => {
          const isSelected = selected === platform.id;
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onSelect(platform.id)}
              className={cn(
                'relative flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all duration-300',
                'hover:-translate-y-0.5 hover:shadow-xl',
                isSelected
                  ? 'border-[#FB3640] ring-1 ring-[#FB3640] bg-[#FB3640]/8 shadow-[0_0_24px_rgba(251,54,64,0.12)]'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              )}
            >
              {platform.popular && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FB3640]/10 text-[#FB3640] border border-[#FB3640]/25">
                  Mashhur
                </span>
              )}

              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300',
                  isSelected
                    ? 'bg-[#FB3640]/15 border-[#FB3640]/40 text-[#FB3640]'
                    : 'bg-zinc-800/70 border-zinc-700 text-zinc-400'
                )}
              >
                {platform.icon}
              </div>

              <div>
                <p className="font-bold text-white text-sm">{platform.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{platform.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={cn(
            'flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm transition-all duration-300',
            'bg-gradient-to-r from-[#FB3640] to-rose-500',
            'hover:shadow-[0_0_30px_rgba(251,54,64,0.3)] hover:scale-[1.02] active:scale-95',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none'
          )}
        >
          Davom etish →
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Keyinroq
        </button>
      </div>
    </div>
  );
}
