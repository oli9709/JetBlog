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

  // ── Tag nomi → WP term ID (mavjudini topadi yoki yangisini yaratadi) ────────
  private async resolveTagIds(names: string[]): Promise<number[]> {
    const ids: number[] = [];
    for (const name of names) {
      try {
        const searchRes = await fetch(
          `${this.baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(name)}&per_page=1`,
          {
            headers: { Authorization: this.authHeader },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (searchRes.ok) {
          const found = (await searchRes.json()) as Array<{ id: number; name: string }>;
          const exact = found.find((t) => t.name.toLowerCase() === name.toLowerCase());
          if (exact) { ids.push(exact.id); continue; }
        }

        // Yangi tag yaratish
        const createRes = await fetch(`${this.baseUrl}/wp-json/wp/v2/tags`, {
          method: 'POST',
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
          signal: AbortSignal.timeout(8000),
        });
        if (createRes.ok) {
          const created = (await createRes.json()) as { id: number };
          ids.push(created.id);
        }
      } catch (err) {
        console.error(`WP tag resolve error for "${name}" (non-fatal):`, err);
      }
    }
    return ids;
  }

  // ── JSON-LD Article structured data ─────────────────────────────────────────
  private buildJsonLd(article: ArticlePayload): string {
    const ld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.seoTitle || article.title,
    };
    if (article.seoDescription) ld.description = article.seoDescription;
    if (article.featuredImageUrl) ld.image = article.featuredImageUrl;
    if (article.tags?.length) ld.keywords = article.tags.join(', ');
    return `\n<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`;
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
      return { ok: false, error: err instanceof Error ? err.message : "Ulanib bo'lmadi" };
    }
  }

  async publish(article: ArticlePayload): Promise<PublishResult> {
    let featuredMediaId: number | undefined;

    // 1. Featured image yuklash (timeout bilan)
    if (article.featuredImageUrl) {
      try {
        const imgRes = await fetch(article.featuredImageUrl, {
          signal: AbortSignal.timeout(15000),
        });
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
            signal: AbortSignal.timeout(15000),
          });
          if (uploadRes.ok) {
            const media = (await uploadRes.json()) as { id: number };
            featuredMediaId = media.id;
          }
        }
      } catch (err) {
        console.error('WP media upload error (non-fatal):', err);
      }
    }

    // 2. Tag nomlarini WP term ID larga aylantirish
    let tagIds: number[] = [];
    if (article.tags?.length) {
      tagIds = await this.resolveTagIds(article.tags);
    }

    // 3. JSON-LD ni content ga qo'shish (SEO plugin bo'lmasa ham ishlaydi)
    const contentWithJsonLd = article.content + this.buildJsonLd(article);

    // 4. Post body
    const postBody: Record<string, unknown> = {
      title: article.title,
      content: contentWithJsonLd,
      status: 'publish',
      // excerpt — plugin talab qilmaydi, meta description sifatida ishlaydi
      ...(article.seoDescription ? { excerpt: article.seoDescription } : {}),
      ...(featuredMediaId ? { featured_media: featuredMediaId } : {}),
      ...(tagIds.length ? { tags: tagIds } : {}),
    };

    // 5. SEO plugin meta (Yoast + RankMath) — best-effort
    //    Foydalanuvchi REST uchun yoqmagan bo'lsa WP e'tiborsiz qoldiradi, xato bermaydi
    const seoMeta: Record<string, string> = {};
    if (article.seoTitle) {
      seoMeta._yoast_wpseo_title = article.seoTitle;
      seoMeta.rank_math_title = article.seoTitle;
    }
    if (article.seoDescription) {
      seoMeta._yoast_wpseo_metadesc = article.seoDescription;
      seoMeta.rank_math_description = article.seoDescription;
    }
    if (Object.keys(seoMeta).length) postBody.meta = seoMeta;

    // 6. Post yaratish
    const res = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'JetBlog/1.0',
      },
      body: JSON.stringify(postBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WP publish failed ${res.status}: ${text.slice(0, 200)}`);
    }

    const post = (await res.json()) as { id: number; link: string };
    return { postId: String(post.id), url: post.link };
  }
}
