import React from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

type CalloutVariant = 'info' | 'warning' | 'danger' | 'success';

const VARIANTS: Record<CalloutVariant, { icon: React.ReactNode; className: string }> = {
  info: {
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
    className: 'bg-blue-500/8 border-blue-500/25 text-blue-300',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    className: 'bg-amber-500/8 border-amber-500/25 text-amber-300',
  },
  danger: {
    icon: <XCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    className: 'bg-red-500/8 border-red-500/25 text-red-300',
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
    className: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300',
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const v = VARIANTS[variant];
  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border text-sm leading-relaxed', v.className, className)}>
      {v.icon}
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}
