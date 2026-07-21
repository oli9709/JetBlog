import 'server-only';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { getEffectiveUser } from './impersonation';

/**
 * Dashboard sahifalar shu ni ishlatsin. `SupabaseSession()` o'rniga.
 *
 * Real auth session (admin) qoladi (auth bepul, cookie va h.k.), lekin
 * data query'lar `userId` sifatida impersonation target'ni oladi. Shuning uchun
 * dashboard sahifalarda o'zgartirish minimal — faqat GetSitesByUser(userId)
 * kabi chaqiruvlarga uzatiladigan id o'zgaradi.
 */
export async function getDashboardUserId(): Promise<{
  realUserId: string | null;
  userId: string | null;
  isImpersonating: boolean;
}> {
  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { realUserId: null, userId: null, isImpersonating: false };

  const eff = await getEffectiveUser(user.id);
  return {
    realUserId: eff.realUserId,
    userId: eff.effectiveUserId,
    isImpersonating: eff.isImpersonating,
  };
}
