import React from 'react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <DocsSidebar />
          <main className="flex-1 min-w-0 max-w-3xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
