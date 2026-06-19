-- Add SEO fields to articles so the unified publish path can carry
-- seoTitle / seoDescription / tags to every adapter (WordPress, Ghost, Webhook).
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS seo_title text,
    ADD COLUMN IF NOT EXISTS seo_description text,
    ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];
