'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SupabaseSignOut } from '@/lib/API/Services/supabase/auth';
import { Icons } from '@/components/Icons';
import { useTheme } from "next-themes";
import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
export function UserNav({ email, display_name, avatar_url }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  
  // Theme dropdown state
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  // User dropdown state
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const signOut = async () => {
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const handleSetTheme = (theme: string) => {
    setTheme(theme);
    setIsThemeOpen(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <div className="relative" ref={themeRef}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsThemeOpen(!isThemeOpen)}
          className="h-9 w-9 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Icons.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icons.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {isThemeOpen && (
          <div className="absolute right-0 mt-1.5 z-50 w-36 rounded-lg border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => handleSetTheme("light")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
            >
              Light
            </button>
            <button
              onClick={() => handleSetTheme("dark")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
            >
              Dark
            </button>
            <button
              onClick={() => handleSetTheme("system")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left focus:outline-none transition-colors duration-150"
            >
              System
            </button>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative" ref={userRef}>
        <Button
          variant="ghost"
          onClick={() => setIsUserOpen(!isUserOpen)}
          className="relative h-9 w-9 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
        >
          <Avatar className="h-9 w-9">
            {avatar_url ? (
              <AvatarImage src={avatar_url} alt="Picture" />
            ) : (
              <AvatarFallback>
                <Icons.User />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>

        {isUserOpen && (
          <div className="absolute right-0 mt-1.5 z-50 w-56 rounded-lg border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2.5 text-left border-b border-muted/30 mb-1">
              <p className="text-sm font-medium leading-none text-foreground">{display_name}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">{email}</p>
            </div>
            
            <div className="p-1 space-y-0.5">
              <Link
                href="/dashboard/todos/my-todos"
                onClick={() => setIsUserOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors duration-150"
              >
                <span>Todos</span>
                <span className="text-xs tracking-widest opacity-60">⇧⌘P</span>
              </Link>
              <Link
                href="/dashboard/settings/billing"
                onClick={() => setIsUserOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors duration-150"
              >
                <span>Billing</span>
                <span className="text-xs tracking-widest opacity-60">⌘B</span>
              </Link>
              <Link
                href="/dashboard/settings/profile"
                onClick={() => setIsUserOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors duration-150"
              >
                <span>Settings</span>
                <span className="text-xs tracking-widest opacity-60">⌘S</span>
              </Link>
            </div>

            <div className="border-t border-muted/30 my-1" />

            <div className="p-1">
              <button
                onClick={signOut}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left focus:outline-none transition-colors duration-150 font-medium"
              >
                <span>Log out</span>
                <span className="text-xs tracking-widest opacity-60">⇧⌘Q</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
