'use client';

import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface StatusBadgeProps {
  status: 'draft' | 'scheduled' | 'published' | 'error';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <div
      className={cn(
        "relative group inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-300",
        "bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a]",
        className
      )}
    >
      {/* Dot Indicator */}
      <span className="relative flex h-2 w-2">
        {status === 'published' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </>
        )}
        {status === 'scheduled' && (
          <>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          </>
        )}
        {status === 'draft' && (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
        )}
        {status === 'error' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" style={{ animationDuration: '1s' }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
          </>
        )}
      </span>

      {/* Label */}
      <span className={cn(
        "relative z-10 transition-colors duration-300",
        status === 'published' && "text-emerald-400 group-hover:text-emerald-300",
        status === 'scheduled' && "text-blue-400 group-hover:text-blue-300",
        status === 'draft' && "text-slate-400 group-hover:text-slate-300",
        status === 'error' && "text-rose-400 group-hover:text-rose-300"
      )}>
        {status === 'published' && "Nashr qilindi"}
        {status === 'scheduled' && "Rejalashtirilgan"}
        {status === 'draft' && "Qoralama"}
        {status === 'error' && "Xatolik"}
      </span>
    </div>
  );
};
