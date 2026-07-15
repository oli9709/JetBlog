/**
 * Article URL'ni normalize qiladi:
 * - Full URL bo'lsa (http/https) — o'zini qaytaradi
 * - Relative path bo'lsa — siteUrl bilan birlashtiradi
 * - Bo'sh yoki noto'g'ri — bo'sh string qaytaradi (throw yo'q)
 *
 * Ishlatilishi:
 *   - publish choke point (adapter javobi normalize)
 *   - GSC / IndexNow / Telegram consumer'lar (safety net)
 */
export function normalizeArticleUrl(
  articleUrl: string | null | undefined,
  siteUrl: string | null | undefined
): string {
  const clean = (articleUrl ?? '').trim();
  if (!clean) return '';

  // Allaqachon full URL
  if (/^https?:\/\//i.test(clean)) return clean;

  const cleanSite = (siteUrl ?? '').trim().replace(/\/+$/, '');
  if (!cleanSite) return clean; // fallback — hech bo'lmasa path qaytar

  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `${cleanSite}${cleanPath}`;
}
