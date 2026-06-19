-- IndexNow key per site (WordPress only; other platforms skip gracefully)
ALTER TABLE public.sites
    ADD COLUMN IF NOT EXISTS indexnow_key text;

-- Published URL returned by adapter.publish() — used for internal linking + SEO pings
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS published_url text;
