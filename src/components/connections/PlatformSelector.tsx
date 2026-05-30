'use client';

import React from 'react';
import { Globe, Ghost, Webhook, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export type PlatformType = 'wordpress' | 'ghost' | 'webflow' | 'webhook';

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
    description: 'REST API orqali avtomatik nashr. Eng keng tarqalgan CMS.',
    icon: <Globe className="w-7 h-7" />,
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Admin API orqali tez va zamonaviy integratsiya.',
    icon: <Ghost className="w-7 h-7" />,
    popular: true,
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: "CMS Collection API orqali dizayner saytlarga nashr.",
    icon: <Layers className="w-7 h-7" />,
  },
  {
    id: 'webhook',
    name: 'Custom (Webhook)',
    description: 'Istalgan platforma bilan webhook orqali integratsiya.',
    icon: <Webhook className="w-7 h-7" />,
  },
];

interface PlatformSelectorProps {
  selected: PlatformType | null;
  onSelect: (platform: PlatformType) => void;
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PLATFORMS.map((platform) => (
        <button
          key={platform.id}
          type="button"
          onClick={() => onSelect(platform.id)}
          className={cn(
            'relative flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all duration-300',
            'hover:-translate-y-0.5 hover:shadow-lg',
            selected === platform.id
              ? 'border-[#FB3640] bg-[#FB3640]/10 shadow-[0_0_20px_rgba(251,54,64,0.15)]'
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
          )}
        >
          {platform.popular && (
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Mashhur
            </span>
          )}

          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300',
              selected === platform.id
                ? 'bg-[#FB3640]/20 border-[#FB3640]/40 text-[#FB3640]'
                : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
            )}
          >
            {platform.icon}
          </div>

          <div>
            <div className="font-bold text-white text-sm">{platform.name}</div>
            <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{platform.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
