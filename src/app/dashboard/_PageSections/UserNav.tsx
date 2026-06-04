'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { useTheme } from 'next-themes';

// ─── Plan badge config ──────────────────────────────────────────────────────────
const PLAN_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  FREE:    { bg: 'bg-gray-500/20',    text: 'text-gray-400',    label: 'Free'    },
  STARTER: { bg: 'bg-blue-500/20',    text: 'text-blue-400',    label: 'Starter' },
  PRO:     { bg: 'bg-[#FB3640]/20',   text: 'text-[#FB3640]',   label: 'Pro'     },
  AGENCY:  { bg: 'bg-purple-500/20',  text: 'text-purple-400',  label: 'Agency'  },
};

function getPlanStyle(plan: string) {
  return PLAN_STYLES[plan?.toUpperCase()] ?? PLAN_STYLES['FREE'];
}

function formatCredits(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface UserNavProps {
  email: string;
  display_name: string;
  avatar_url: string;
  plan: string;
  credits_remaining: number;
}

export function UserNav({ email, display_name, avatar_url, plan, credits_remaining }: UserNavProps) {
  const { setTheme } = useTheme();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setIsThemeOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcuts: ⌘P → profile, ⌘B → billing, ⇧⌘Q → logout
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isUserOpen) return;
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'p') {
        e.preventDefault();
        window.location.href = '/dashboard/settings/profile';
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        window.location.href = '/dashboard/settings/billing';
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        signOut();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isUserOpen]);

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  };

  const planStyle = getPlanStyle(plan);

  return (
    <div className="flex items-center space-x-4">
      {/* ── Theme Toggle ─────────────────────────────────── */}
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
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); setIsThemeOpen(false); }}
                className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── User Menu ─────────────────────────────────────── */}
      <div className="relative" ref={userRef}>
        <Button
          variant="ghost"
          onClick={() => setIsUserOpen(!isUserOpen)}
          className="relative h-9 w-9 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
        >
          <Avatar className="h-9 w-9">
            {avatar_url ? (
              <AvatarImage src={avatar_url} alt="Profile" />
            ) : (
              <AvatarFallback>
                <Icons.User />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>

        {isUserOpen && (
          <div className="absolute right-0 mt-1.5 z-50 w-60 rounded-lg border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-2 duration-150">

            {/* ── User info ── */}
            <div className="px-3 py-2.5 border-b border-muted/30 mb-1">
              <p className="text-sm font-medium leading-none text-foreground truncate">
                {display_name || email}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">{email}</p>
            </div>

            {/* ── Plan badge + credits ── */}
            <div className="px-3 py-2 border-b border-muted/30 mb-1 flex items-center justify-between gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${planStyle.bg} ${planStyle.text}`}>
                {planStyle.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="font-semibold text-foreground">{formatCredits(credits_remaining)}</span> kredit qoldi
              </span>
            </div>

            {/* ── Menu items ── */}
            <div className="p-1 space-y-0.5">
              <Link
                href="/dashboard/settings/profile"
                onClick={() => setIsUserOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
              >
                <span>Profil sozlamalari</span>
                <span className="text-xs tracking-widest opacity-60">⌘P</span>
              </Link>
              <Link
                href="/dashboard/settings/billing"
                onClick={() => setIsUserOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
              >
                <span>Billing &amp; Obuna</span>
                <span className="text-xs tracking-widest opacity-60">⌘B</span>
              </Link>
            </div>

            <div className="border-t border-muted/30 my-1" />

            {/* ── Logout ── */}
            <div className="p-1">
              <button
                onClick={signOut}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors font-medium"
              >
                <span>Chiqish</span>
                <span className="text-xs tracking-widest opacity-60">⇧⌘Q</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
