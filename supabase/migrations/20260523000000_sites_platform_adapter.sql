ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS platform_type TEXT NOT NULL DEFAULT 'wordpress',
  ADD COLUMN IF NOT EXISTS adapter_config JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN sites.platform_type IS 'wordpress | ghost | webhook';
COMMENT ON COLUMN sites.adapter_config IS 'Platform-specific config: Ghost API keys, webhook URL/secret, etc.';
