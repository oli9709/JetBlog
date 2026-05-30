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
          'X-TextPilot-Signature': signature,
          'X-TextPilot-Event': 'ping',
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

    const res = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TextPilot-Signature': signature,
        'X-TextPilot-Event': 'article.published',
      },
      body,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Webhook publish failed ${res.status}: ${text.slice(0, 200)}`);
    }

    // Webhook receiver may return { postId, url } — use it if provided
    let postId = `webhook-${Date.now()}`;
    let url = this.endpointUrl;

    try {
      const json = await res.json() as { postId?: string; url?: string };
      if (json.postId) postId = json.postId;
      if (json.url) url = json.url;
    } catch {
      // non-JSON response is fine — we already got 2xx
    }

    return { postId, url };
  }
}
