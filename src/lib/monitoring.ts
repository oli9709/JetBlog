import * as Sentry from '@sentry/nextjs';

/**
 * AI generatsiya xatoliklarini Sentry ga yuborish.
 * Faqat production / staging muhitlarida to'liq ishlaydi.
 */
export function captureGenerationError(
  error: Error,
  context: {
    userId: string;
    siteId: string;
    keyword: string;
    creditsRemaining: number;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'ai-generation');
    scope.setTag('platform', 'anthropic');
    scope.setUser({ id: context.userId });
    scope.setContext('generation', {
      siteId: context.siteId,
      keyword: context.keyword,
      creditsRemaining: context.creditsRemaining,
    });
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Publish xatoliklarini Sentry ga yuborish.
 * platform tegi qaysi adapter (wordpress/ghost/webhook) xato berganini ko'rsatadi.
 */
export function capturePublishError(
  error: Error,
  context: {
    userId: string;
    siteId: string;
    platform: string;
    articleId: string;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'publish');
    scope.setTag('platform', context.platform);
    scope.setUser({ id: context.userId });
    scope.setContext('publish', {
      siteId: context.siteId,
      articleId: context.articleId,
    });
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

/**
 * Umumiy API xatoliklarini qo'shimcha context bilan yuborish.
 */
export function captureApiError(
  error: Error,
  context: Record<string, unknown>
): void {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'api');
    scope.setContext('api', context);
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}
