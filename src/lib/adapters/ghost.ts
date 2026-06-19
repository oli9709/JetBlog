import 'server-only';
import { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';
import jwt from 'jsonwebtoken';

export class GhostAdapter implements SiteAdapter {
  private readonly apiUrl: string;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(apiUrl: string, adminApiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    const [id, secret] = adminApiKey.split(':');
    if (!id || !secret) throw new Error('Ghost adminApiKey must be in "id:secret" format');
    this.keyId = id;
    this.keySecret = secret;
  }

  private buildJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      { iat: now, exp: now + 300, aud: '/admin/' },
      Buffer.from(this.keySecret, 'hex'),
      { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT', kid: this.keyId } }
    );
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Ghost ${this.buildJwt()}`,
      'Content-Type': 'application/json',
      'Accept-Version': 'v5.0',
    };
  }

  async verify(): Promise<VerifyResult> {
    try {
      const res = await fetch(`${this.apiUrl}/ghost/api/admin/posts/?limit=1`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) return { ok: true };
      const body = await res.text();
      return { ok: false, error: `Ghost API ${res.status}: ${body.slice(0, 200)}` };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'Ulanib bo\'lmadi' };
    }
  }

  async publish(article: ArticlePayload): Promise<PublishResult> {
    const postBody: Record<string, unknown> = {
      posts: [
        {
          title: article.title,
          html: article.content,
          status: 'published',
          ...(article.seoTitle ? { og_title: article.seoTitle, twitter_title: article.seoTitle, meta_title: article.seoTitle } : {}),
          ...(article.seoDescription ? { og_description: article.seoDescription, twitter_description: article.seoDescription, meta_description: article.seoDescription } : {}),
          ...(article.featuredImageUrl ? { feature_image: article.featuredImageUrl } : {}),
          ...(article.tags?.length
            ? { tags: article.tags.map((t) => ({ name: t })) }
            : {}),
        },
      ],
    };

    // ?source=html — Ghost ga HTML sifatida qabul qilishni buyuradi,
    // aks holda mobilizer content ni tashlashi mumkin
    const res = await fetch(`${this.apiUrl}/ghost/api/admin/posts/?source=html`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(postBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ghost publish failed ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json() as { posts: Array<{ id: string; url: string }> };
    const post = data.posts[0];
    return { postId: post.id, url: post.url };
  }
}
