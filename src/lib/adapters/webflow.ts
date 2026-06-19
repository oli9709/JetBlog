import 'server-only';
import { SiteAdapter, ArticlePayload, PublishResult, VerifyResult } from './base';
import type { WebflowFieldMap } from '@/lib/types/supabase';

/**
 * Webflow Data API v2 adapter
 *
 * Docs: https://developers.webflow.com/data/reference
 *
 * Flow:
 *   verify()  → GET /v2/collections/{collectionId}  (8s timeout)
 *   publish() → POST /v2/collections/{collectionId}/items  (isDraft: false, 15s timeout)
 *               → image field set as { url, alt } if fieldMap.image is provided (non-fatal)
 *               → returns { postId: itemId, url: liveUrl }
 *
 * Credential note: apiToken is stored AES-256-GCM encrypted in DB and decrypted
 * by getAdapter() before this constructor is called — this class receives
 * a PLAIN token and must never log or expose it.
 */
export class WebflowAdapter implements SiteAdapter {
  private readonly token: string;
  private readonly collectionId: string;
  private readonly siteId: string;
  private readonly collectionSlug: string;
  private readonly siteDomain: string;
  private readonly fieldMap: WebflowFieldMap;

  constructor(opts: {
    token: string;
    siteId: string;
    collectionId: string;
    collectionSlug: string;
    siteDomain: string;
    fieldMap: WebflowFieldMap;
  }) {
    this.token         = opts.token;
    this.siteId        = opts.siteId;
    this.collectionId  = opts.collectionId;
    this.collectionSlug = opts.collectionSlug;
    this.siteDomain    = opts.siteDomain;
    this.fieldMap      = opts.fieldMap;
  }

  // ── Yordamchi: autentifikatsiya headerlari ───────────────────────────────

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  // ── Yordamchi: URL slug hosil qilish ────────────────────────────────────

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')   // maxsus belgilarni olib tashlash
      .replace(/\s+/g, '-')       // bo'shliq → tire
      .replace(/-+/g, '-')        // ketma-ket tiralarni birlashtirish
      .replace(/^-|-$/g, '')      // bosh/oxirdagi tiralarni olib tashlash
      .slice(0, 120);             // Webflow slug uzunligi chegarasi
  }

  // ── Yordamchi: noyob slug hosil qilish ──────────────────────────────────

  private static uniqueSlug(title: string): string {
    const base = WebflowAdapter.slugify(title);
    const suffix = Date.now().toString(36); // masalan 'lzdqk5'
    return `${base}-${suffix}`;
  }

  // ── verify(): kolleksiya mavjudligini va token to'g'riligini tekshirish ──

  async verify(): Promise<VerifyResult> {
    try {
      const res = await fetch(
        `https://api.webflow.com/v2/collections/${this.collectionId}`,
        {
          method: 'GET',
          headers: this.headers,
          signal: AbortSignal.timeout(8_000),
        }
      );

      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Webflow API Token noto'g'ri yoki ruxsat yo'q." };
      }
      if (res.status === 404) {
        return { ok: false, error: "Kolleksiya topilmadi. Collection ID ni tekshiring." };
      }
      if (res.status === 402) {
        return { ok: false, error: "Webflow CMS API uchun Starter plan talab qilinadi." };
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return { ok: false, error: `Webflow API ${res.status}: ${txt.slice(0, 100)}` };
      }

      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Webflow ga ulanib bo'lmadi",
      };
    }
  }

  // ── publish(): CMS item yaratish va LIVE nashr qilish ───────────────────

  async publish(article: ArticlePayload): Promise<PublishResult> {
    const slug = WebflowAdapter.uniqueSlug(article.title);

    // ── fieldData qurilishi ────────────────────────────────────────────────
    // `name` va `slug` Webflow da MAJBURIY tizim maydonlari
    const fieldData: Record<string, unknown> = {
      name: article.title,
      slug,
    };

    // Ixtiyoriy qo'shimcha sarlavha maydoni (foydalanuvchi xaritalagan)
    if (this.fieldMap.title && this.fieldMap.title !== 'name') {
      fieldData[this.fieldMap.title] = article.title;
    }

    // Maqola HTML kontenti (RichText maydoni)
    fieldData[this.fieldMap.body] = article.content;

    // SEO tavsif / xulosasi
    if (this.fieldMap.summary && article.seoDescription) {
      fieldData[this.fieldMap.summary] = article.seoDescription;
    }

    // Muqova rasm — Webflow Image maydonlari { url, alt } shakliga ega
    // Non-fatal: rasm xato bo'lsa ham nashr davom etadi
    if (this.fieldMap.image && article.featuredImageUrl) {
      fieldData[this.fieldMap.image] = {
        url: article.featuredImageUrl,
        alt: article.seoTitle ?? article.title,
      };
    }

    // ── CMS item yaratish — isDraft: false → darhol LIVE ─────────────────
    const payload = {
      isArchived: false,
      isDraft: false,   // to'g'ridan-to'g'ri publish qilish
      fieldData,
    };

    const createRes = await fetch(
      `https://api.webflow.com/v2/collections/${this.collectionId}/items`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (createRes.status === 402) {
      throw new Error("Webflow CMS API uchun Starter plan talab qilinadi. Bepul rejada nashr bo'lmaydi.");
    }
    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => '');
      throw new Error(`Webflow CMS item yaratishda xatolik ${createRes.status}: ${errText.slice(0, 300)}`);
    }

    const item = (await createRes.json()) as {
      id: string;
      fieldData?: { slug?: string };
    };

    const itemId   = item.id;
    const itemSlug = (item.fieldData?.slug ?? slug);

    // ── Live URL qurilishi ────────────────────────────────────────────────
    // Format: https://{domain}/{collectionSlug}/{itemSlug}
    const domain  = this.siteDomain.replace(/\/$/, '');
    const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    const liveUrl = `${baseUrl}/${this.collectionSlug}/${itemSlug}`;

    return { postId: itemId, url: liveUrl };
  }
}
