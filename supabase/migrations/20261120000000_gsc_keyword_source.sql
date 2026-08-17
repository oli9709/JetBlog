-- GSC auto-discovery: keyword source tracking + GSC metrics per keyword
-- MUHIM: Prod Supabase → SQL Editor'да qo'lda run qiling.

ALTER TABLE keywords
  ADD COLUMN IF NOT EXISTS source text
    CHECK (source IN ('manual','gsc_auto','ai_suggested')) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS gsc_impressions int,
  ADD COLUMN IF NOT EXISTS gsc_position numeric(5,2),
  ADD COLUMN IF NOT EXISTS gsc_synced_at timestamptz;

-- Duplikatlarni oldini olish (case-insensitive per site)
CREATE UNIQUE INDEX IF NOT EXISTS keywords_site_keyword_unique
  ON keywords (site_id, LOWER(keyword));
