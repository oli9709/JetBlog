CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  endpoint_url text NOT NULL,
  secret_key text NOT NULL,
  events text[] DEFAULT ARRAY['article.published'],
  is_active boolean DEFAULT true,
  retry_count int DEFAULT 0,
  last_status int,
  last_triggered_at timestamp,
  created_at timestamp DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own webhooks" ON webhooks
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));
