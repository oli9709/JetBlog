import '../styles/globals.css';
import { InterFont } from '@/styles/fonts';
import { ThemeProvider } from '@/styles/ThemeProvider';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import NextTopLoader from 'nextjs-toploader';
import config from '@/lib/config/site';
import type { Metadata } from 'next';

const BASE_URL = 'https://jet-blog-zeta.vercel.app';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

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

const RootLayout = ({ children }) => {
  return (
    <html suppressHydrationWarning lang="en" className={`${InterFont.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color={config.loading_bar_color} />
          {children}
        </ThemeProvider>
        <ToastContainer position="bottom-right" transition={Bounce} />
      </body>
    </html>
  );
};

export default RootLayout;
