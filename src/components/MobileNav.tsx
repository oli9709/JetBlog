'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NavItem } from '@/lib/types/types';
import { Icons } from '@/components/Icons';

export interface NavProps {
  items?: NavItem[];
}

export const MobileNav = ({ items = [] }: NavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        className="focus:outline-none p-2 rounded-lg hover:bg-accent text-foreground transition-colors duration-200"
        aria-label="Toggle Menu"
      >
        <Icons.Menu size={28} />
      </button>

      {/* Fullscreen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-top-5 duration-200">
          {/* Header Area */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              JetBlog
            </span>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-accent text-foreground transition-colors duration-200"
              aria-label="Close Menu"
            >
              <Icons.Close size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4 p-8 overflow-y-auto">
            {items.map((item) => {
              const IconComp = (item.icon && typeof item.icon === 'string' ? Icons[item.icon as keyof typeof Icons] : item.icon) || Icons.Link;
              return (
                <Link
                  key={item.title}
                  href={item.link}
                  onClick={closeMenu}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-accent text-foreground hover:text-primary font-medium text-lg transition-all duration-200"
                >
                  <IconComp size={22} className="text-muted-foreground group-hover:text-primary" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};
