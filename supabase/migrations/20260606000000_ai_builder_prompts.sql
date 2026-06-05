-- AI Builder Prompts: webhook table kengaytirish
ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS source_platform  TEXT        NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS prompt_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connection_tested   BOOLEAN     NOT NULL DEFAULT false;

COMMENT ON COLUMN public.webhooks.source_platform     IS 'Platforma: nextjs | laravel | django | nuxt | custom';
COMMENT ON COLUMN public.webhooks.prompt_generated_at IS 'AI builder prompt oxirgi marta qachon generatsiya qilingani';
COMMENT ON COLUMN public.webhooks.connection_tested   IS 'Webhook test so''rov muvaffaqiyatli o''tganmi';
