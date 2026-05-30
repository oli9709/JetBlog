import 'server-only';
import { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';
import { decryptText } from '@/lib/utils/encryption';

export class WordPressAdapter implements SiteAdapter {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(siteUrl: string, username: string, encryptedPassword: string) {
    this.baseUrl = WordPressAdapter.normalizeUrl(siteUrl);
    const password = decryptText(encryptedPassword).replace(/\s+/g, '');
    this.authHeader = 'Basic ' + Buffer.from(`${username.trim()}:${password}`).toString('base64');
  }

  private static normalizeUrl(url: string): string {
    return url.replace(/\/$/, '').replace(/\/wp-json.*$/, '');
  }

  async verify(): Promise<VerifyResult> {
    try {
      const res = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts?per_page=1`, {
        method: 'GET',
        headers: { Authorization: this.authHeader },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) return { ok: true };
      return { ok: false, error: `WordPress API ${res.status}: ${res.statusText}` };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'Ulanib bo\'lmadi' };
    }
  }

  async publish(article: ArticlePayload): Promise<PublishResult> {
    let featuredMediaId: number | undefined;

    // 1. Featured image yuklash
    if (article.featuredImageUrl) {
      try {
        const imgRes = await fetch(article.featuredImageUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const filename = `jetblog-${Date.now()}.jpg`;
          const uploadRes = await fetch(`${this.baseUrl}/wp-json/wp/v2/media`, {
            method: 'POST',
            headers: {
              Authorization: this.authHeader,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Type': 'image/jpeg',
            },
            body: buffer,
          });
          if (uploadRes.ok) {
            const media = await uploadRes.json() as { id: number };
            featuredMediaId = media.id;
          }
        }
      } catch (err) {
        console.error('WP media upload error (non-fatal):', err);
      }
    }

    // 2. Post yaratish
    const postBody: Record<string, unknown> = {
      title: article.title,
      content: article.content,
      status: 'publish',
      ...(featuredMediaId ? { featured_media: featuredMediaId } : {}),
      ...(article.tags?.length ? { tags: article.tags } : {}),
    };

    // Yoast SEO / RankMath meta
    if (article.seoTitle) postBody.yoast_head_json = { title: article.seoTitle };
    if (article.seoDescription) {
      (postBody as Record<string, unknown>).meta = { _yoast_wpseo_metadesc: article.seoDescription };
    }

    const res = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'JetBlog/1.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WP publish failed ${res.status}: ${text.slice(0, 200)}`);
    }

    const post = await res.json() as { id: number; link: string };
    return { postId: String(post.id), url: post.link };
  }
}
