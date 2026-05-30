'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'bash', filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-xl overflow-hidden border border-white/8', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          {filename && (
            <span className="text-xs text-zinc-500 ml-2 font-mono">{filename}</span>
          )}
          {!filename && language && (
            <span className="text-xs text-zinc-600 ml-2 uppercase tracking-wider">{language}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200',
            copied
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600'
          )}
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Nusxalandi</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Nusxalash</>
          )}
        </button>
      </div>
      <pre
        className={cn(
          'p-4 text-sm overflow-x-auto leading-relaxed bg-[#0a0a0a]',
          'text-zinc-300 font-mono'
        )}
      >
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[#FB3640] bg-[#FB3640]/10 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  );
}
