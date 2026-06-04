// @ts-check
const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
    ],
  },
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // CI build larda Sentry output ni yashirish
  silent: true,

  // Source map upload imkoniyatini kengaytirish
  widenClientFileUpload: true,

  // Production da source map lari foydalanuvchiga ko'rinmasin
  hideSourceMaps: true,

  // @sentry/nextjs logger ni o'chirish (build output toza bo'lsin)
  disableLogger: true,

  // Sentry tunneling — ad-blocker larni chetlab o'tish
  tunnelRoute: '/monitoring-tunnel',
});
