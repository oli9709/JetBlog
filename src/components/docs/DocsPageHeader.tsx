import React from 'react';

interface DocsPageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
}

export function DocsPageHeader({ badge, title, description }: DocsPageHeaderProps) {
  return (
    <div className="mb-10 pb-8 border-b border-zinc-800/80">
      {badge && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FB3640] mb-3">
          {badge}
        </span>
      )}
      <h1 className="text-3xl font-extrabold text-white mb-3">{title}</h1>
      {description && (
        <p className="text-zinc-400 leading-relaxed text-base max-w-2xl">{description}</p>
      )}
    </div>
  );
}

export function DocsH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-[#FB3640] rounded-full" />
      {children}
    </h2>
  );
}

export function DocsH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-zinc-200 mt-6 mb-3">{children}</h3>
  );
}

export function DocsPara({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-zinc-400 text-sm leading-relaxed mb-4">{children}</p>
  );
}
