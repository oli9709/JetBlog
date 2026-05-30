export interface DocItem {
  slug: string;
  title: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

export const docsSitemap: DocSection[] = [
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
];

export function getAllSlugs(): string[] {
  return docsSitemap.flatMap((section) => section.items.map((item) => item.slug));
}

export function getDocTitle(slug: string): string | undefined {
  for (const section of docsSitemap) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return item.title;
  }
}
