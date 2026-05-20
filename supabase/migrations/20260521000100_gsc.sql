-- GSC OAuth tokens saqlash
CREATE TABLE IF NOT EXISTS gsc_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamp with time zone,
  gsc_site_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, site_id)
);

ALTER TABLE gsc_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own gsc tokens" ON gsc_tokens
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
