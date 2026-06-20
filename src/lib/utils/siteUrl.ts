/**
 * Platform-aware display URL helpers.
 *
 * Problem: `site.url` is only populated for WordPress and Webflow.
 *   - Ghost:   address lives in adapter_config.apiUrl
 *   - Webhook: address lives in adapter_config.endpointUrl
 *   - Webflow: site.url may be empty; adapter_config.siteDomain is the canonical host
 *
 * All helpers return `string` (never null / undefined) so callers can safely
 * call .replace() or render without crashing.
 */

import type { SiteT } from '@/lib/types/supabase';

/**
 * Minimal subset needed by these helpers.
 * All fields are optional/nullable — that's the whole point of this module.
 * Callers with partial or platform-specific site shapes all satisfy this type.
 */
type SiteForDisplay = {
  platform_type?: string | null;
  url?: string | null;
  adapter_config?: Record<string, unknown> | null;
};

/**
 * Returns the canonical URL for the site, reading from `adapter_config` for
 * platforms where `site.url` is not set (webhook, ghost) or is secondary (webflow).
 *
 * Always returns a string — empty string `''` when nothing is available.
 */
export function getDisplayUrl(site: SiteForDisplay): string {
  const cfg = (site.adapter_config ?? {}) as Record<string, unknown>;

  switch (site.platform_type) {
    case 'ghost':
      return (cfg['apiUrl'] as string | undefined) ?? site.url ?? '';
    case 'webhook':
      return (cfg['endpointUrl'] as string | undefined) ?? site.url ?? '';
    case 'webflow': {
      const domain = cfg['siteDomain'] as string | undefined;
      return domain ? `https://${domain}` : (site.url ?? '');
    }
    case 'wordpress':
    default:
      return site.url ?? '';
  }
}

/**
 * Returns the host-only portion of the display URL, stripped of protocol and
 * trailing slashes. Safe to use in card headings and <option> labels.
 *
 * Returns `'—'` when no URL is resolvable (prevents empty/blank labels).
 */
export function getDisplayHost(site: SiteForDisplay): string {
  const url = getDisplayUrl(site);
  const host = url.replace(/^https?:\/\//, '').replace(/\/+$/, '').trim();
  return host || '—';
}
