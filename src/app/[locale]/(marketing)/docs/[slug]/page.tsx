import React from 'react';
import { notFound } from 'next/navigation';
import { getAllSlugs, getDocsSitemap } from '@/lib/config/docs';
import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { NimaPage } from '@/components/docs/content/NimaPage';
import { QuickStartPage } from '@/components/docs/content/QuickStartPage';
import { KreditlarPage } from '@/components/docs/content/KreditlarPage';
import { WordPressPage } from '@/components/docs/content/WordPressPage';
import { GhostPage } from '@/components/docs/content/GhostPage';
import { WebflowPage } from '@/components/docs/content/WebflowPage';
import { WebhookPage } from '@/components/docs/content/WebhookPage';
import { MaqolaGeneratsiyaPage } from '@/components/docs/content/MaqolaGeneratsiyaPage';
import { BrandVoicePage } from '@/components/docs/content/BrandVoicePage';
import { KalitSozlarPage } from '@/components/docs/content/KalitSozlarPage';
import { GscPage } from '@/components/docs/content/GscPage';
import { TelegramPage } from '@/components/docs/content/TelegramPage';
import { WebhooksIntPage } from '@/components/docs/content/WebhooksIntPage';
import { ApiAuthPage } from '@/components/docs/content/ApiAuthPage';
import { ApiEndpointsPage } from '@/components/docs/content/ApiEndpointsPage';
import { ApiErrorsPage } from '@/components/docs/content/ApiErrorsPage';
import { AIBuilders } from '@/components/docs/content/AIBuilders';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const sitemap = getDocsSitemap(locale as 'uz' | 'ru' | 'en');
  const title = sitemap.flatMap((s) => s.items).find((i) => i.slug === slug)?.title;
  return {
    title: title ? `${title} — JetBlog Docs` : 'JetBlog Docs',
  };
}

export default async function DocsSlugPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = await getLocale();

  const CONTENT_MAP: Record<string, React.ReactNode> = {
    'nima': <NimaPage locale={locale} />,
    'quick-start': <QuickStartPage locale={locale} />,
    'kreditlar': <KreditlarPage locale={locale} />,
    'wordpress': <WordPressPage locale={locale} />,
    'ghost': <GhostPage locale={locale} />,
    'webflow': <WebflowPage locale={locale} />,
    'webhook': <WebhookPage locale={locale} />,
    'maqola-generatsiya': <MaqolaGeneratsiyaPage locale={locale} />,
    'brand-voice': <BrandVoicePage locale={locale} />,
    'kalit-sozlar': <KalitSozlarPage locale={locale} />,
    'google-search-console': <GscPage locale={locale} />,
    'telegram': <TelegramPage locale={locale} />,
    'webhooks': <WebhooksIntPage locale={locale} />,
    'api-auth': <ApiAuthPage locale={locale} />,
    'api-endpoints': <ApiEndpointsPage locale={locale} />,
    'api-errors': <ApiErrorsPage locale={locale} />,
    'ai-builders': <AIBuilders locale={locale} />,
  };

  const content = CONTENT_MAP[slug];
  if (!content) notFound();
  return <>{content}</>;
}
