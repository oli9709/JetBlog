-- GSC auto-discovery: keyword source tracking + GSC metrics per keyword
-- MUHIM: Prod Supabase → SQL Editor'да qo'lda run qiling.

ALTER TABLE keywords
  ADD COLUMN IF NOT EXISTS source text
    CHECK (source IN ('manual','gsc_auto','ai_suggested')) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS gsc_impressions int,
  ADD COLUMN IF NOT EXISTS gsc_position numeric(5,2),
  ADD COLUMN IF NOT EXISTS gsc_synced_at timestamptz;

-- Partial unique index — faqat active (pending/approved) uchun.
-- Nima uchun partial: `completed` statusdagi tarixiy yozuvlar bir xil keyword
-- uchun bir necha marta bo'lishi normal (har oy takror generatsiya qilinsa
-- yoki eski data'да allaqachon duplicate bo'lsa). Full unique index prodni
-- sindirar edi. Bu index esa auto-discovery yoki user qo'lda takror qo'sha
-- olmasligini kafolatlaydi.
CREATE UNIQUE INDEX IF NOT EXISTS keywords_site_keyword_active_unique
  ON keywords (site_id, LOWER(keyword))
  WHERE status IN ('pending','approved');
