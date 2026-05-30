'use client';

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils/helpers';

export type PlatformTab = 'wordpress' | 'ghost' | 'webflow' | 'webhook';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface PlatformTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function PlatformTabs({ tabs, defaultTab, className }: PlatformTabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultTab ?? tabs[0]?.id} className={className}>
      <TabsPrimitive.List className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-xl w-fit mb-6">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.id}
            value={tab.id}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
              'text-zinc-400 hover:text-white',
              'data-[state=active]:bg-[#FB3640] data-[state=active]:text-white data-[state=active]:shadow-md'
            )}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content key={tab.id} value={tab.id}>
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
