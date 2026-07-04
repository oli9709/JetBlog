'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/helpers';

export const ClientHeader = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled 
          ? 'bg-black/80 backdrop-blur-md border-zinc-800/80 shadow-lg py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </header>
  );
};
