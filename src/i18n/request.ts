import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const headersList = await headers();

  // Vercel geo-detection
  const country = headersList.get('x-vercel-ip-country') ?? '';

  let locale = await requestLocale;

  // Agar locale URL dan aniqlanmagan bo'lsa — geo/default fallback
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    if (country === 'UZ') {
      locale = 'uz';
    } else if (['RU', 'KZ', 'KG', 'TJ', 'BY'].includes(country)) {
      locale = 'ru';
    } else {
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
