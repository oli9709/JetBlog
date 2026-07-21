import 'server-only';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { createClient } from '@supabase/supabase-js';

export type AdminRole = 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

/** Admin service-role client (RLS bypass). Faqat guard passed'дан keyin ishlаtiling. */
export function adminServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Server komponentlar va API routelarda. Admin bo'lmasa null. */
export async function requireAdmin(): Promise<AdminUser | null> {
  try {
    const supabase = await SupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const svc = adminServiceClient();
    const { data: profile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) return null;

    return { id: user.id, email: user.email, role: profile.role as AdminRole };
  } catch {
    return null;
  }
}

/** Faqat super_admin. */
export async function requireSuperAdmin(): Promise<AdminUser | null> {
  const admin = await requireAdmin();
  return admin?.role === 'super_admin' ? admin : null;
}
