-- Admin Panel V1 — role system, audit log, impersonation
-- MUHIM: Prod Supabase Dashboard → SQL Editor'da qo'lda run qiling.

-- 1) Role tizimi (eski is_admin ustuni saqlanadi backwards compat uchun)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text
    CHECK (role IN ('user','admin','super_admin')) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role != 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended) WHERE is_suspended = true;

-- Eski is_admin=true bo'lganlarni role='admin' ga migratsiya qilish
UPDATE profiles
SET role = 'admin'
WHERE role = 'user' AND is_admin = true;

-- Otabek → super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'otabekmardanov3@gmail.com' LIMIT 1);

-- 2) Audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_email text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin
  ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target
  ON admin_audit_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON admin_audit_log(action, created_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log"
  ON admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin','super_admin')
    )
  );

-- 3) Impersonation sessions
CREATE TABLE IF NOT EXISTS admin_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_impersonation_admin_active
  ON admin_impersonation_sessions(admin_id, ended_at)
  WHERE ended_at IS NULL;

ALTER TABLE admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
-- default deny — faqat service role
