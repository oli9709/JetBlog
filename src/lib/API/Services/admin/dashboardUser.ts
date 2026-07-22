import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { getEffectiveUser } from './impersonation';
import { adminServiceClient } from './guard';

/**
 * Dashboard sahifalar shu ni ishlatsin. `SupabaseSession()` o'rniga.
 *
 * Impersonation vaqtida:
 *  - `userId` = target user id
 *  - `db`     = service-role client (RLS bypass; admin target user'ning
 *               row'larini o'qish uchun ruxsat oladi)
 *
 * Oddiy holатда:
 *  - `userId` = real user id
 *  - `db`     = normal auth-scoped client
 */
export async function getDashboardUserId(): Promise<{
  realUserId: string | null;
  userId: string | null;
  isImpersonating: boolean;
  db: SupabaseClient | null;
}> {
  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { realUserId: null, userId: null, isImpersonating: false, db: null };

  const eff = await getEffectiveUser(user.id);
  return {
    realUserId: eff.realUserId,
    userId: eff.effectiveUserId,
    isImpersonating: eff.isImpersonating,
    db: eff.isImpersonating ? adminServiceClient() : supabase,
  };
}
