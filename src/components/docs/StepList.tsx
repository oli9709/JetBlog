import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface Step {
  title?: string;
  description: React.ReactNode;
}

interface StepListProps {
  steps: Step[];
  className?: string;
}

export function StepList({ steps, className }: StepListProps) {
  return (
    <ol className={cn('relative flex flex-col gap-0', className)}>
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4 group">
          {/* Line + number */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FB3640]/15 border border-[#FB3640]/30 text-[#FB3640] text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-zinc-800 mt-1 mb-1 min-h-[1.5rem]" />
            )}
          </div>

          {/* Content */}
          <div className={cn('pb-6', i === steps.length - 1 && 'pb-0')}>
            {step.title && (
              <p className="font-semibold text-white text-sm mb-1">{step.title}</p>
            )}
            <div className="text-sm text-zinc-400 leading-relaxed">{step.description}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
