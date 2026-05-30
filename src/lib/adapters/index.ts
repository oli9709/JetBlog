import 'server-only';
import { SiteAdapter } from './base';
import { WordPressAdapter } from './wordpress';
import { GhostAdapter } from './ghost';
import { WebhookAdapter } from './webhook';
import type { SiteT, GhostAdapterConfig, WebhookAdapterConfig } from '@/lib/types/supabase';

export { WordPressAdapter } from './wordpress';
export { GhostAdapter } from './ghost';
export { WebhookAdapter } from './webhook';
export type { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';

/**
 * Factory: site record ga qarab to'g'ri adapter qaytaradi.
 */
export function getAdapter(site: SiteT): SiteAdapter {
  switch (site.platform_type) {
    case 'wordpress':
      return new WordPressAdapter(site.url, site.wp_username, site.wp_password ?? '');

    case 'ghost': {
      const cfg = site.adapter_config as GhostAdapterConfig;
      if (!cfg.apiUrl || !cfg.adminApiKey) {
        throw new Error('Ghost adapter config missing apiUrl or adminApiKey');
      }
      return new GhostAdapter(cfg.apiUrl, cfg.adminApiKey);
    }

    case 'webhook': {
      const cfg = site.adapter_config as WebhookAdapterConfig;
      if (!cfg.endpointUrl || !cfg.secretKey) {
        throw new Error('Webhook adapter config missing endpointUrl or secretKey');
      }
      return new WebhookAdapter(cfg.endpointUrl, cfg.secretKey);
    }

    default:
      throw new Error(`Unknown platform_type: ${(site as SiteT).platform_type}`);
  }
}
