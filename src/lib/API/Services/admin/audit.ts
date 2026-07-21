import 'server-only';
import { adminServiceClient } from './guard';

export type AuditAction =
  | 'credits.added'
  | 'credits.deducted'
  | 'subscription.cancelled'
  | 'subscription.reactivated'
  | 'user.suspended'
  | 'user.unsuspended'
  | 'user.deactivated'
  | 'user.deleted_permanently'
  | 'admin.added'
  | 'admin.removed'
  | 'admin.role_changed'
  | 'impersonation.started'
  | 'impersonation.ended';

export interface AuditParams {
  adminId: string;
  adminEmail: string;
  action: AuditAction;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: Record<string, unknown>;
}

/** Barcha admin action'lar shundan o'tsin. Xatolar swallowed emas — log qoladi. */
export async function logAdminAction(params: AuditParams): Promise<void> {
  try {
    const svc = adminServiceClient();
    const { error } = await svc.from('admin_audit_log').insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action: params.action,
      target_user_id: params.targetUserId ?? null,
      target_user_email: params.targetUserEmail ?? null,
      details: params.details ?? null,
    });
    if (error) {
      console.error('[admin/audit] insert failed', { action: params.action, message: error.message });
    } else {
      console.log('[admin]', params.action, {
        admin: params.adminEmail,
        target: params.targetUserEmail,
        details: params.details,
      });
    }
  } catch (err) {
    console.error('[admin/audit] unexpected exception', err);
  }
}
