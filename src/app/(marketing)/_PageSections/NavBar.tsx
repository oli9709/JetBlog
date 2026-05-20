'use client';
import * as React from 'react';
import Link from 'next/link';
import { MobileNav, NavProps } from '@/components/MobileNav';
import { cn } from '@/lib/utils/helpers';

export const Nav = ({ items }: NavProps) => {
  return (
    <div>
      <nav className="hidden md:flex items-center gap-1">
        {items.map((item) => (
          <Link 
            key={item.title}
            href={item.link}
            className={cn(
              "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "text-zinc-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-none"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <MobileNav items={items} />
    </div>
  );
};
