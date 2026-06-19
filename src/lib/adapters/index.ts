import 'server-only';
import { SiteAdapter } from './base';
import { WordPressAdapter } from './wordpress';
import { GhostAdapter } from './ghost';
import { WebhookAdapter } from './webhook';
import { WebflowAdapter } from './webflow';
import type { SiteT, GhostAdapterConfig, WebhookAdapterConfig, WebflowAdapterConfig } from '@/lib/types/supabase';
import { decryptText } from '@/lib/utils/encryption';

export { WordPressAdapter } from './wordpress';
export { GhostAdapter } from './ghost';
export { WebhookAdapter } from './webhook';
export { WebflowAdapter } from './webflow';
export type { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';

/**
 * Factory: site record ga qarab to'g'ri adapter qaytaradi.
 *
 * Barcha maxfiy ma'lumotlar shu yerda shifrdan chiqariladi:
 *   - wordpress  → wp_password  (WordPressAdapter ichida decryptText qiladi)
 *   - ghost      → adminApiKey  (bu yerda decryptText)
 *   - webhook    → secretKey    (bu yerda decryptText)
 *
 * @throws {CredentialDecryptError} agar kalit noto'g'ri bo'lsa
 */
export function getAdapter(site: SiteT): SiteAdapter {
  switch (site.platform_type) {
    case 'wordpress':
      // WordPressAdapter o'z ichida decryptText chaqiradi
      return new WordPressAdapter(site.url, site.wp_username, site.wp_password ?? '');

    case 'ghost': {
      const cfg = site.adapter_config as GhostAdapterConfig;
      if (!cfg.apiUrl || !cfg.adminApiKey) {
        throw new Error('Ghost adapter config missing apiUrl or adminApiKey');
      }
      // adminApiKey DB da shifrlangan saqlanadi — bu yerda ochamiz
      return new GhostAdapter(cfg.apiUrl, decryptText(cfg.adminApiKey));
    }

    case 'webhook': {
      const cfg = site.adapter_config as WebhookAdapterConfig;
      if (!cfg.endpointUrl || !cfg.secretKey) {
        throw new Error('Webhook adapter config missing endpointUrl or secretKey');
      }
      // secretKey DB da shifrlangan saqlanadi — bu yerda ochamiz
      return new WebhookAdapter(cfg.endpointUrl, decryptText(cfg.secretKey));
    }

    case 'webflow': {
      const cfg = site.adapter_config as WebflowAdapterConfig;
      if (!cfg.apiToken || !cfg.siteId || !cfg.collectionId) {
        throw new Error('Webflow adapter config: apiToken, siteId, collectionId talab qilinadi');
      }
      if (!cfg.fieldMap?.body) {
        throw new Error(
          "Webflow adapter config: fieldMap.body (HTML kontent maydoni) o'rnatilmagan. " +
          "Sozlamalar → Connections da saytni qayta ulang va maydonlarni xaritang."
        );
      }
      return new WebflowAdapter({
        token:          decryptText(cfg.apiToken),
        siteId:         cfg.siteId,
        collectionId:   cfg.collectionId,
        collectionSlug: cfg.collectionSlug ?? 'posts',
        siteDomain:     cfg.siteDomain ?? '',
        fieldMap:       cfg.fieldMap,
      });
    }

    default:
      throw new Error(`Unknown platform_type: ${(site as SiteT).platform_type}`);
  }
}
