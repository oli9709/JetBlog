-- Article generation status kengaytirish
-- Yangi statuslar: queued, generating, imaging, publishing, published, failed

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS generation_error TEXT,
  ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMPTZ;

-- Status check constraint yangilash
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE articles
  ADD CONSTRAINT articles_status_check CHECK (
    status IN ('draft', 'scheduled', 'published', 'error', 'queued', 'generating', 'imaging', 'publishing', 'failed')
  );

-- Realtime uchun articles jadvalini yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
