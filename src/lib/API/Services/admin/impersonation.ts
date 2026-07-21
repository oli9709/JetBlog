import 'server-only';
import { cookies } from 'next/headers';
import { adminServiceClient } from './guard';

export const IMPERSONATION_COOKIE = 'jetblog_impersonation';

export interface EffectiveUser {
  realUserId: string;
  effectiveUserId: string;
  isImpersonating: boolean;
  targetEmail?: string;
}

/** Dashboard sahifalar shu ni ishlatsin — effective user id ni oladi. */
export async function getEffectiveUser(realUserId: string): Promise<EffectiveUser> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  if (!sessionId) {
    return { realUserId, effectiveUserId: realUserId, isImpersonating: false };
  }

  const svc = adminServiceClient();
  const { data: sess } = await svc
    .from('admin_impersonation_sessions')
    .select('id, admin_id, target_user_id, ended_at, expires_at')
    .eq('id', sessionId)
    .maybeSingle();

  if (
    !sess ||
    sess.ended_at ||
    new Date(sess.expires_at) <= new Date() ||
    sess.admin_id !== realUserId
  ) {
    return { realUserId, effectiveUserId: realUserId, isImpersonating: false };
  }

  // Target email — banner uchun
  const { data: authUser } = await svc.auth.admin.getUserById(sess.target_user_id);

  return {
    realUserId,
    effectiveUserId: sess.target_user_id,
    isImpersonating: true,
    targetEmail: authUser?.user?.email ?? undefined,
  };
}
