'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { docsSitemap } from '@/lib/config/docs';
import { cn } from '@/lib/utils/helpers';

export function DocsSidebar() {
  const pathname = usePathname();
  const currentSlug = pathname.split('/').pop() ?? '';

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    docsSitemap.forEach((sec) => {
      init[sec.title] = sec.items.some((i) => i.slug === currentSlug);
    });
    // open first section by default
    if (docsSitemap[0]) init[docsSitemap[0].title] = true;
    return init;
  });

  const toggle = (title: string) =>
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2 scrollbar-thin">
        <nav className="flex flex-col gap-1">
          {docsSitemap.map((section) => {
            const isOpen = openSections[section.title] ?? false;
            const hasActive = section.items.some((i) => i.slug === currentSlug);

            return (
              <div key={section.title}>
                <button
                  type="button"
                  onClick={() => toggle(section.title)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-200',
                    hasActive ? 'text-[#FB3640]' : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {section.title}
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="ml-2 flex flex-col gap-0.5 mb-2">
                    {section.items.map((item) => {
                      const isActive = item.slug === currentSlug;
                      return (
                        <Link
                          key={item.slug}
                          href={`/docs/${item.slug}`}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                            'border-l-2',
                            isActive
                              ? 'border-[#FB3640] bg-[#FB3640]/8 text-white font-medium'
                              : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 hover:border-zinc-700'
                          )}
                        >
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FB3640] shrink-0" />
                          )}
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
