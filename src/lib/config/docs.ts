export interface DocItem {
  slug: string;
  title: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

const DOCS_SITEMAP_BY_LOCALE: Record<string, DocSection[]> = {
  uz: [
    {
      title: 'Boshlash',
      items: [
        { slug: 'nima', title: 'JetBlog nima?' },
        { slug: 'quick-start', title: '5 daqiqada sozlash' },
        { slug: 'kreditlar', title: 'Kredit tizimi' },
      ],
    },
    {
      title: 'Platformalar',
      items: [
        { slug: 'wordpress', title: 'WordPress' },
        { slug: 'ghost', title: 'Ghost CMS' },
        { slug: 'webflow', title: 'Webflow' },
        { slug: 'webhook', title: 'Custom / Webhook' },
      ],
    },
    {
      title: 'AI va kontent',
      items: [
        { slug: 'maqola-generatsiya', title: 'Maqola generatsiya' },
        { slug: 'brand-voice', title: 'Brand voice' },
        { slug: 'kalit-sozlar', title: "Kalit so'zlar" },
      ],
    },
    {
      title: 'Integratsiyalar',
      items: [
        { slug: 'google-search-console', title: 'Google Search Console' },
        { slug: 'telegram', title: 'Telegram bildirish' },
        { slug: 'webhooks', title: 'Webhooks' },
        { slug: 'ai-builders', title: 'AI Builder Prompts' },
      ],
    },
    {
      title: "API ma'lumotnoma",
      items: [
        { slug: 'api-auth', title: 'Autentifikatsiya' },
        { slug: 'api-endpoints', title: 'Endpointlar' },
        { slug: 'api-errors', title: 'Xato kodlari' },
      ],
    },
  ],
  ru: [
    {
      title: 'Начало',
      items: [
        { slug: 'nima', title: 'Что такое JetBlog?' },
        { slug: 'quick-start', title: 'Настройка за 5 минут' },
        { slug: 'kreditlar', title: 'Система кредитов' },
      ],
    },
    {
      title: 'Платформы',
      items: [
        { slug: 'wordpress', title: 'WordPress' },
        { slug: 'ghost', title: 'Ghost CMS' },
        { slug: 'webflow', title: 'Webflow' },
        { slug: 'webhook', title: 'Custom / Webhook' },
      ],
    },
    {
      title: 'AI и контент',
      items: [
        { slug: 'maqola-generatsiya', title: 'Генерация статей' },
        { slug: 'brand-voice', title: 'Brand voice' },
        { slug: 'kalit-sozlar', title: 'Ключевые слова' },
      ],
    },
    {
      title: 'Интеграции',
      items: [
        { slug: 'google-search-console', title: 'Google Search Console' },
        { slug: 'telegram', title: 'Уведомления Telegram' },
        { slug: 'webhooks', title: 'Webhooks' },
        { slug: 'ai-builders', title: 'AI Builder Prompts' },
      ],
    },
    {
      title: 'Справочник API',
      items: [
        { slug: 'api-auth', title: 'Аутентификация' },
        { slug: 'api-endpoints', title: 'Эндпоинты' },
        { slug: 'api-errors', title: 'Коды ошибок' },
      ],
    },
  ],
  en: [
    {
      title: 'Getting Started',
      items: [
        { slug: 'nima', title: 'What is JetBlog?' },
        { slug: 'quick-start', title: 'Setup in 5 minutes' },
        { slug: 'kreditlar', title: 'Credit system' },
      ],
    },
    {
      title: 'Platforms',
      items: [
        { slug: 'wordpress', title: 'WordPress' },
        { slug: 'ghost', title: 'Ghost CMS' },
        { slug: 'webflow', title: 'Webflow' },
        { slug: 'webhook', title: 'Custom / Webhook' },
      ],
    },
    {
      title: 'AI & Content',
      items: [
        { slug: 'maqola-generatsiya', title: 'Article generation' },
        { slug: 'brand-voice', title: 'Brand voice' },
        { slug: 'kalit-sozlar', title: 'Keywords' },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { slug: 'google-search-console', title: 'Google Search Console' },
        { slug: 'telegram', title: 'Telegram notifications' },
        { slug: 'webhooks', title: 'Webhooks' },
        { slug: 'ai-builders', title: 'AI Builder Prompts' },
      ],
    },
    {
      title: 'API Reference',
      items: [
        { slug: 'api-auth', title: 'Authentication' },
        { slug: 'api-endpoints', title: 'Endpoints' },
        { slug: 'api-errors', title: 'Error codes' },
      ],
    },
  ],
};

// Default (Uzbek) export kept for backwards compat with server components that don't have locale
export const docsSitemap: DocSection[] = DOCS_SITEMAP_BY_LOCALE.uz;

export function getDocsSitemap(locale: string): DocSection[] {
  return DOCS_SITEMAP_BY_LOCALE[locale] ?? DOCS_SITEMAP_BY_LOCALE.uz;
}

export function getAllSlugs(): string[] {
  return docsSitemap.flatMap((section) => section.items.map((item) => item.slug));
}

export function getDocTitle(slug: string): string | undefined {
  for (const section of docsSitemap) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return item.title;
  }
}
