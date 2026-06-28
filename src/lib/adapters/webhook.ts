import 'server-only';
import crypto from 'crypto';
import { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';

export class WebhookAdapter implements SiteAdapter {
  private readonly endpointUrl: string;
  private readonly secretKey: string;

  constructor(endpointUrl: string, secretKey: string) {
    this.endpointUrl = endpointUrl;
    this.secretKey = secretKey;
  }

  private sign(body: string): string {
    return 'sha256=' + crypto.createHmac('sha256', this.secretKey).update(body).digest('hex');
  }

  async verify(): Promise<VerifyResult> {
    try {
      const body = JSON.stringify({ event: 'ping', data: {}, timestamp: new Date().toISOString() });
      const signature = this.sign(body);

      const res = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-JetBlog-Signature': signature,
          'X-JetBlog-Event': 'ping',
        },
        body,
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) return { ok: true };
      return { ok: false, error: `Webhook ${res.status}: ${res.statusText}` };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'Ulanib bo\'lmadi' };
    }
  }

  async publish(article: ArticlePayload): Promise<PublishResult> {
    const payload = {
      title: article.title,
      content: article.content,
      featuredImageUrl: article.featuredImageUrl ?? null,
      seoTitle: article.seoTitle ?? null,
      seoDescription: article.seoDescription ?? null,
      tags: article.tags ?? [],
    };

    const body = JSON.stringify({
      event: 'article.published',
      data: payload,
      timestamp: new Date().toISOString(),
    });

    const signature = this.sign(body);

    // Render kabi bepul hostinglar harakatsizlikdan keyin "uxlaydi" (cold-start ~40-50s).
    // Har urinishda 60s timeout (uyg'onishni qoplaydi) + 5xx/timeout da qayta urinish.
    // 4xx — doimiy xato (imzo/format), qayta urinilmaydi.
    const maxAttempts = 3;
    const perAttemptTimeoutMs = 60000;
    let lastError = "noma'lum xato";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(this.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-JetBlog-Signature': signature,
            'X-JetBlog-Event': 'article.published',
          },
          body,
          signal: AbortSignal.timeout(perAttemptTimeoutMs),
        });

        // 5xx (masalan Render "Service Starting" 503) — receiver uyg'onmoqda, qayta urinamiz
        if (res.status >= 500) {
          throw new Error(`Webhook ${res.status} (receiver uyg'onmoqda)`);
        }

        // 4xx — doimiy xato, qayta urinish foydasiz
        if (!res.ok) {
          const text = await res.text();
          throw Object.assign(
            new Error(`Webhook publish failed ${res.status}: ${text.slice(0, 200)}`),
            { permanent: true }
          );
        }

        // 2xx — muvaffaqiyat
        let postId = `webhook-${Date.now()}`;
        let url = this.endpointUrl;
        try {
          const json = (await res.json()) as { postId?: string; url?: string };
          if (json.postId) postId = json.postId;
          if (json.url) url = json.url;
        } catch {
          // non-JSON 2xx javob ham OK
        }
        return { postId, url };
      } catch (err: unknown) {
        // 4xx (permanent) — darhol tashlaymiz, retry yo'q
        if (err && typeof err === 'object' && 'permanent' in err) throw err;
        lastError = err instanceof Error ? err.message : 'Webhook ulanish xatosi';
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
        }
      }
    }

    throw new Error(`Webhook publish ${maxAttempts} urinishdan keyin muvaffaqiyatsiz: ${lastError}`);
  }
}
