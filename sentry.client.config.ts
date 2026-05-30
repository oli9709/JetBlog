import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Production da minimal sampling, dev da to'liq
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Foydalanuvchi ma'lumotlarini himoya qilish
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session replay: production da minimal, xatolarda har doim
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  // Dev da Sentry konsolga chiqarmasin
  debug: false,
});
