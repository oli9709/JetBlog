import '../../styles/globals.css';
import { InterFont } from '@/styles/fonts';
import { ThemeProvider } from '@/styles/ThemeProvider';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import NextTopLoader from 'nextjs-toploader';
import config, { SITE_URL } from '@/lib/config/site';
import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';

const BASE_URL = SITE_URL;
const OG_IMAGE = config.ogImage;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'JetBlog — AI SEO Autopilot',
    template: '%s | JetBlog',
  },
  description:
    "WordPress saytingiz uchun AI SEO autopilot. Claude AI yordamida kalit so'z tahlili, avtomatik maqola generatsiyasi va nashr.",
  keywords: [
    'AI SEO', 'WordPress autopilot', 'maqola generatsiya', 'SEO automation',
    'Claude AI', 'JetBlog', 'content marketing',
  ],
  authors: [{ name: 'JetBlog' }],
  creator: 'JetBlog',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: BASE_URL,
    siteName: 'JetBlog',
    title: 'JetBlog — AI SEO Autopilot',
    description:
      "WordPress saytingiz uchun AI SEO autopilot. Kalit so'z tahlili, maqola generatsiyasi va avtomatik nashr.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'JetBlog — AI SEO Autopilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JetBlog — AI SEO Autopilot',
    description:
      "WordPress saytingiz uchun AI SEO autopilot.",
    images: [OG_IMAGE],
    creator: '@jetblog_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  return (
    <html suppressHydrationWarning lang={locale} className={`${InterFont.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <NextTopLoader color={config.loading_bar_color} />
            {children}
          </ThemeProvider>
          <ToastContainer position="bottom-right" transition={Bounce} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
