'use client';

import React from 'react';
import CountUp from 'react-countup';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface CreditsBadgeProps {
  credits: number;
  className?: string;
}

export const CreditsBadge: React.FC<CreditsBadgeProps> = ({ credits, className }) => {
  const isHigh = credits >= 20;
  const isMedium = credits >= 5 && credits < 20;
  const isLow = credits < 5;

  return (
    <div
      className={cn(
        "relative group inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-500 cursor-default",
        "bg-[#111111] backdrop-blur-md border border-[#222222] hover:border-white/20",
        isHigh && "shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] text-emerald-400",
        isMedium && "shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-400",
        isLow && "border-rose-500/50 bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]",
        className
      )}
    >
      {/* Subtle background glow */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-md pointer-events-none",
          isHigh && "bg-emerald-500",
          isMedium && "bg-amber-500 animate-pulse",
          isLow && "bg-rose-600 animate-pulse"
        )} 
      />
      
      <span className="relative flex items-center gap-2 z-10">
        {isHigh && <Sparkles className="w-4 h-4 text-emerald-400/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
        {isLow && <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />}
        <CountUp end={credits} duration={2.5} separator="," className="font-mono text-base" /> 
        <span>kredit</span>
        {isLow && <span className="font-bold text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">!</span>}
      </span>
    </div>
  );
};
