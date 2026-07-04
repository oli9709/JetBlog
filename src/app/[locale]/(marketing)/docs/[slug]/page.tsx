import React from 'react';
import { notFound } from 'next/navigation';
import { getAllSlugs, getDocTitle } from '@/lib/config/docs';
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

const CONTENT_MAP: Record<string, React.ReactNode> = {
  'nima': <NimaPage />,
  'quick-start': <QuickStartPage />,
  'kreditlar': <KreditlarPage />,
  'wordpress': <WordPressPage />,
  'ghost': <GhostPage />,
  'webflow': <WebflowPage />,
  'webhook': <WebhookPage />,
  'maqola-generatsiya': <MaqolaGeneratsiyaPage />,
  'brand-voice': <BrandVoicePage />,
  'kalit-sozlar': <KalitSozlarPage />,
  'google-search-console': <GscPage />,
  'telegram': <TelegramPage />,
  'webhooks': <WebhooksIntPage />,
  'api-auth': <ApiAuthPage />,
  'api-endpoints': <ApiEndpointsPage />,
  'api-errors': <ApiErrorsPage />,
  'ai-builders': <AIBuilders />,
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const title = getDocTitle(slug);
  return {
    title: title ? `${title} — JetBlog Docs` : 'JetBlog Docs',
  };
}

export default async function DocsSlugPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const content = CONTENT_MAP[slug];
  if (!content) notFound();
  return <>{content}</>;
}
