-- Public frontend URL override — backend receiver boshqa domenда bo'lsa
-- (masalan .onrender.com), lekin blog haqiqatда chillbusantours.com'да
-- host qilinса, Telegram / share link'lar public domenда bo'lsin.

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS public_url text;

COMMENT ON COLUMN sites.public_url IS
  'Optional: public-facing frontend URL. If set, JetBlog rewrites the origin of published_url when composing user-visible links (Telegram, share). Leave NULL to keep the receiver-supplied URL as-is.';
