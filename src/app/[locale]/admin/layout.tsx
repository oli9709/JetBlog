import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { Link } from '@/i18n/navigation';
import { LayoutProps } from '@/lib/types/types';

export const dynamic = 'force-dynamic';

const NAV = [
  { title: 'Overview', href: '/admin' },
  { title: 'Invoices', href: '/admin/invoices' },
  { title: 'Users', href: '/admin/users' }
];

export default async function AdminLayout({ children }: LayoutProps) {
  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect('/auth/login');

  // is_admin tekshiruvi — service role bilan (RLS bypass)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/dashboard/main');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-white/10 flex flex-col p-4 gap-1">
        <div className="text-sm font-bold text-white/40 uppercase tracking-widest px-3 py-2 mb-2">
          Admin Panel
        </div>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {item.title}
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <Link href="/dashboard/main" className="px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors block">
            ← Dashboard
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
