'use client';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import type { FAQCategory as FAQCategoryType } from '@/lib/constants/faq';

interface FAQCategoryProps {
  category: FAQCategoryType;
  defaultOpen?: boolean;
}

export function FAQCategory({ category, defaultOpen = false }: FAQCategoryProps) {
  const Icon = category.icon;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/60">
        <div className="w-8 h-8 rounded-lg bg-[#FB3640]/10 border border-[#FB3640]/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#FB3640]" />
        </div>
        <span className="font-bold text-white">{category.title}</span>
        <span className="ml-auto text-xs font-medium text-zinc-600 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
          {category.items.length} ta savol
        </span>
      </div>

      {/* Accordion */}
      <AccordionPrimitive.Root
        type="multiple"
        defaultValue={defaultOpen ? [category.items[0]?.id ?? ''] : []}
        className="divide-y divide-zinc-800/50"
      >
        {category.items.map((item) => (
          <AccordionPrimitive.Item key={item.id} value={item.id} className="group">
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all duration-200',
                  'hover:bg-zinc-900/40',
                  'data-[state=open]:border-l-2 data-[state=open]:border-[#FB3640] data-[state=open]:bg-[#FB3640]/5',
                  'border-l-2 border-transparent'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium leading-snug transition-colors duration-200',
                    'text-zinc-300 group-hover:text-white',
                    'data-[state=open]:text-white'
                  )}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 shrink-0 text-zinc-600 transition-all duration-300',
                    'group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#FB3640]'
                  )}
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                'overflow-hidden',
                'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up'
              )}
            >
              <p className="px-6 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-l-2 border-[#FB3640]/30 ml-0">
                {item.answer}
              </p>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </div>
  );
}
