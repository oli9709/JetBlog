-- ============================================================
-- Webflow platformasi qo'shildi (2026-06-19)
-- ============================================================

-- platform_type ustuniga 'webflow' qo'shildi — chek yo'q (text maydon),
-- faqat izoh yangilanadi.
COMMENT ON COLUMN public.sites.platform_type IS 'wordpress | ghost | webhook | webflow';

-- adapter_config izohini yangilash
COMMENT ON COLUMN public.sites.adapter_config IS
  'Platform-specific config (JSONB, sirlar shifrlangan):\n'
  '  wordpress: {}  (wp_password sites.wp_password ustunida shifrlangan)\n'
  '  ghost:     { apiUrl, adminApiKey (encrypted) }\n'
  '  webhook:   { endpointUrl, secretKey (encrypted) }\n'
  '  webflow:   { apiToken (encrypted), siteId, collectionId, collectionSlug, siteDomain,\n'
  '               fieldMap: { body (req), title?, summary?, image? } }';
