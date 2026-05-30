import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Edge runtime da tracing eng minimal bo'lsin
  tracesSampleRate: 0.1,
  debug: false,
});
