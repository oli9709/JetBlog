import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/API/Services/admin/guard';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const isSuperAdmin = admin.role === 'super_admin';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#FB3640]">JetBlog</span>
            <span className="text-xs text-white/40 uppercase tracking-widest">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60">{admin.email}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSuperAdmin
                  ? 'bg-[#FB3640]/15 text-[#FF6B6B] border-[#FB3640]/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {admin.role}
            </span>
            <Link
              href="/dashboard/main"
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 py-6 pr-6 border-r border-white/5 min-h-[calc(100vh-56px)]">
          <nav className="flex flex-col gap-1 sticky top-6">
            <NavItem href="/admin" label="Overview" />
            <NavItem href="/admin/users" label="Users" />
            {isSuperAdmin && <NavItem href="/admin/team" label="Team" />}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </Link>
  );
}
