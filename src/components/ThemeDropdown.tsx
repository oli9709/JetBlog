'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/Icons';
import { useTheme } from 'next-themes';

export const ThemeDropDownMenu = () => {
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetTheme = (theme: string) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="mr-4 relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <Icons.Sun
          size={22}
          className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Icons.Moon
          size={22}
          className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 z-50 w-28 rounded-lg border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleSetTheme('light')}
            className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
          >
            Light
          </button>
          <button
            onClick={() => handleSetTheme('dark')}
            className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
          >
            Dark
          </button>
          <button
            onClick={() => handleSetTheme('system')}
            className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
          >
            System
          </button>
        </div>
      )}
    </div>
  );
};
