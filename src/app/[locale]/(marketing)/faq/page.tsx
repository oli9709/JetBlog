import type { Metadata } from 'next';
import Script from 'next/script';
import { FAQPage } from '@/components/faq/FAQPage';
import { getAllFAQItems } from '@/lib/constants/faq';

export const metadata: Metadata = {
  title: 'FAQ — JetBlog',
  description:
    'Find answers to the most common questions about JetBlog: platforms, credits, article generation and technical details.',
};

function buildJsonLd() {
  const items = getAllFAQItems();
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export default function FAQRoute() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#000F08] py-16 px-4 sm:px-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-10 blur-[120px] bg-[#FB3640] rounded-full -z-10" />
        <FAQPage />
      </div>
    </>
  );
}
