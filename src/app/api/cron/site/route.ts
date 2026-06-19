/**
 * /api/cron/site — Avtopilot ISHCHI (bir sayt, bir ishga tushirish)
 *
 * Har bir chaqiruv faqat bitta site_id ni qayta ishlaydi:
 *   1. Idempotency: (site_id, run_date) kombinatsiyasini atomik ravishda qayd qiladi
 *      → agar allaqachon qayd qilingan bo'lsa → 200 qaytaradi (ikki marta nashr yo'q)
 *   2. Kredit rezervasiya: reserve_credit() RPC orqali atomik kamaytiradi
 *      → kredit 0 bo'lsa → article_run 'failed' holatga o'tkaziladi
 *   3. Maqola generatsiya (Claude) + rasm (DALL-E)
 *   4. Publish (publishArticle → getAdapter → SEO post-steps)
 *   5. Muvaffaqiyatda: article_run 'completed', keyword 'completed'
 *   6. Xatoda: refund_credit() RPC → article 'error' → article_run 'failed'
 *
 * Avtorizatsiya:
 *   - QStash imzosi (QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY)
 *   - Yoki fallback: Authorization: Bearer <CRON_SECRET>
 *
 * QStash retry semantikasi:
 *   - 200 qaytarsa → muvaffaqiyat, qayta urinmaydi
 *   - 5xx qaytarsa → QStash qayta urinadi (max 3 marta)
 *   - Doimiy xatolar (kredit yo'q, keyword yo'q) → 200 + error payload
 *     (idempotency jadvali qayta urinishdan himoya qiladi)
 */

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Receiver } from '@upstash/qstash';
import { GenerateArticleWithClaude, PriorArticleRef } from '@/lib/API/Services/claude/generate';
import { GenerateCoverImage } from '@/lib/API/Services/image/generate';
import { publishArticle } from '@/lib/API/Services/publish/publishArticle';
import { sendTelegramPost } from '@/lib/API/Services/telegram/notify';
import { SiteT, ArticleT } from '@/lib/types/supabase';

export const dynamic = 'force-dynamic';
// Vercel Pro/Enterprise: 300 soniyalik timeout — generatsiya + publish uchun yetarli
export const maxDuration = 300;

// ── Service-role Supabase client (RLS bypass) ─────────────────────────────────

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ── Autorizatsiya ─────────────────────────────────────────────────────────────

function isFallbackAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

// ── Asosiy ishchi mantiq ──────────────────────────────────────────────────────

async function processOneSite(siteId: string): Promise<{ status: string; reason?: string }> {
  const db = serviceClient();
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' UTC

  // ── 1. Idempotency: (site_id, run_date) ni atomik qayd qilish ────────────
  // ON CONFLICT DO NOTHING: agar allaqachon yozuv mavjud bo'lsa — hech narsa qilmaydi
  const { data: inserted, error: insertRunErr } = await db
    .from('article_runs')
    .insert({ site_id: siteId, run_date: today, status: 'processing', started_at: new Date().toISOString() })
    .select('id')
    .single();

  if (insertRunErr) {
    // 23505 = unique_violation — bu sayt bugun allaqachon qayta ishlangan
    if (insertRunErr.code === '23505') {
      console.log(`[Worker] Idempotency: site=${siteId} bugun allaqachon qayta ishlangan.`);
      return { status: 'duplicate', reason: 'Bugun allaqachon nashr qilingan (idempotent).' };
    }
    // Boshqa DB xatolari — 5xx qaytarish (QStash qayta urinadi)
    throw new Error(`article_runs yozishda xatolik: ${insertRunErr.message}`);
  }

  const runId = inserted.id as string;

  // ── Yordamchi: run ni yangilash ──────────────────────────────────────────
  const updateRun = (fields: Record<string, unknown>) =>
    db.from('article_runs').update(fields).eq('id', runId);

  // ── 2. Sayt ma'lumotlarini olish ─────────────────────────────────────────
  const { data: rawSite, error: siteErr } = await db
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (siteErr || !rawSite) {
    await updateRun({ status: 'failed', error: 'Sayt topilmadi', completed_at: new Date().toISOString() });
    return { status: 'error', reason: 'Sayt topilmadi.' };
  }
  const site = rawSite as SiteT;

  // ── 3. Kredit rezervasiya (atomik RPC) ───────────────────────────────────
  const { data: reserved, error: creditErr } = await db.rpc('reserve_credit', { p_user_id: site.user_id });

  if (creditErr) {
    await updateRun({ status: 'failed', error: creditErr.message, completed_at: new Date().toISOString() });
    throw new Error(`reserve_credit RPC xatoligi: ${creditErr.message}`); // 5xx → retry
  }
  if (!reserved) {
    await updateRun({ status: 'failed', error: 'Kreditlar tugagan', completed_at: new Date().toISOString() });
    return { status: 'error', reason: 'Kreditlar tugagan.' }; // 200 → qayta urinma
  }

  // Xato yuz berganda kreditni qaytarish uchun bayroq
  let creditReserved = true;

  const refundCredit = async () => {
    if (!creditReserved) return;
    try {
      await db.rpc('refund_credit', { p_user_id: site.user_id });
      creditReserved = false;
    } catch (e) {
      console.error('[Worker] refund_credit xatoligi:', e);
    }
  };

  // ── 4. Tasdiqlangan keyword ───────────────────────────────────────────────
  const { data: keywords } = await db
    .from('keywords')
    .select('*')
    .eq('site_id', siteId)
    .in('status', ['approved', 'pending'])
    .order('created_at', { ascending: true })
    .limit(1);

  if (!keywords || keywords.length === 0) {
    await refundCredit();
    await updateRun({ status: 'failed', error: "Kalit so'z topilmadi", completed_at: new Date().toISOString() });
    return { status: 'skipped', reason: "Tasdiqlangan kalit so'z topilmadi." };
  }
  const keyword = keywords[0];
  await updateRun({ keyword_id: keyword.id });

  try {
    // ── 5. Ichki havolalar uchun oldingi maqolalar ───────────────────────
    let priorArticles: PriorArticleRef[] = [];
    try {
      const { data: published } = await db
        .from('articles')
        .select('title, published_url')
        .eq('site_id', siteId)
        .eq('status', 'published')
        .not('published_url', 'is', null)
        .order('published_at', { ascending: false })
        .limit(20);

      if (published && published.length >= 2) {
        priorArticles = (published as Array<{ title: string; published_url: string }>)
          .map((a) => ({ title: a.title, url: a.published_url }));
      }
    } catch (e) {
      console.warn('[Worker] Oldingi maqolalarni olishda xatolik (kritik emas):', e);
    }

    // ── 6. Claude bilan maqola generatsiya ──────────────────────────────
    const draft = await GenerateArticleWithClaude({
      keyword: keyword.keyword,
      brandVoice: site.brand_voice,
      language: keyword.language,
      priorArticles,
    });

    // ── 7. DALL-E muqova rasm (xato bo'lsa ham davom etamiz) ─────────────
    let coverUrl: string | null = null;
    try {
      coverUrl = await GenerateCoverImage({
        keyword: keyword.keyword,
        title: draft.title,
        language: keyword.language,
      });
    } catch (imgErr) {
      console.error('[Worker] Rasm yaratishda xatolik (kritik emas):', imgErr);
    }

    // ── 8. Qo'llab-quvvatlanmagan platform tekshiruvi ────────────────────
    const supportedPlatforms = ['wordpress', 'ghost', 'webhook'];
    if (!supportedPlatforms.includes(site.platform_type)) {
      const errMsg = `Qo'llab-quvvatlanmagan platform_type: ${site.platform_type}`;
      await refundCredit();
      await updateRun({ status: 'failed', error: errMsg, completed_at: new Date().toISOString() });
      return { status: 'error', reason: errMsg };
    }

    // ── 9. Maqolani DB ga 'draft' statusida saqlash ──────────────────────
    const { data: articleData, error: insertArticleErr } = await db
      .from('articles')
      .insert([{
        site_id: siteId,
        keyword_id: keyword.id,
        title: draft.title,
        content: draft.content,
        seo_title: draft.seoTitle || null,
        seo_description: draft.seoDescription || null,
        tags: draft.tags || [],
        featured_image_url: coverUrl || null,
        status: 'draft',
        ai_tokens_used: draft.tokensUsed || 0,
      }])
      .select()
      .single();

    if (insertArticleErr || !articleData) {
      await refundCredit();
      throw new Error(`Maqolani bazaga saqlab bo'lmadi: ${insertArticleErr?.message}`);
    }

    const article = articleData as ArticleT;
    await updateRun({ article_id: article.id });

    // ── 10. Publish (yagona yo'l: publishArticle → getAdapter → SEO) ─────
    let publishResult;
    try {
      publishResult = await publishArticle(site, article);
    } catch (publishErr: unknown) {
      const msg = publishErr instanceof Error ? publishErr.message : 'Publish xatosi';
      await refundCredit();
      await db.from('articles').update({ status: 'error', error_message: msg }).eq('id', article.id);
      await updateRun({ status: 'failed', error: msg, completed_at: new Date().toISOString() });
      console.error(`[Worker] site=${siteId} publish xatoligi:`, publishErr);
      return { status: 'error', reason: msg }; // 200 → doimiy xato, qayta urinma
    }

    // ── 11. Muvaffaqiyat: maqola va keyword statusini yangilash ──────────
    await db.from('articles').update({
      status: 'published',
      published_at: new Date().toISOString(),
      wp_post_id: isNaN(Number(publishResult.postId)) ? null : Number(publishResult.postId),
      published_url: publishResult.url || null,
    }).eq('id', article.id);

    await db.from('keywords').update({
      status: 'completed',
      article_id: article.id,
    }).eq('id', keyword.id);

    creditReserved = false; // kredit to'g'ri sarflandi, qaytarish shart emas

    await updateRun({
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    // ── 12. Telegram anons (kritik emas) ─────────────────────────────────
    if (site.telegram_chat_id) {
      try {
        const articleUrl = publishResult.url || site.url.replace(/\/+$/, '');
        const excerpt = draft.content
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 220) + '...';

        await sendTelegramPost({
          chatId: site.telegram_chat_id,
          title: draft.title,
          excerpt,
          url: articleUrl,
          imageUrl: coverUrl,
        });
      } catch (teleErr) {
        console.error('[Worker] Telegram anons xatoligi (kritik emas):', teleErr);
      }
    }

    console.log(`[Worker] ✅ site=${siteId} keyword="${keyword.keyword}" → ${publishResult.url}`);
    return { status: 'success', reason: publishResult.url };

  } catch (err: unknown) {
    // Kutilmagan xato: kredit qaytarish + run failed
    await refundCredit();
    const msg = err instanceof Error ? err.message : 'Kutilmagan xatolik';
    await updateRun({ status: 'failed', error: msg, completed_at: new Date().toISOString() });
    console.error(`[Worker] site=${siteId} kutilmagan xato:`, err);
    // 5xx qaytarish — QStash qayta urinadi (tranzient xatolar uchun)
    throw err;
  }
}

// ── QStash imzo tekshirish (Receiver orqali) ──────────────────────────────────
// verifySignatureAppRouter (@upstash/qstash/nextjs) o'rniga Receiver ishlatiladi —
// Turbopack subpath eksport muammosini oldini olish uchun.

async function verifyQStash(req: Request): Promise<{ ok: boolean; rawBody: string }> {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY ?? '';
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY ?? '';
  const signature = req.headers.get('upstash-signature') ?? '';
  const rawBody = await req.text();
  if (!currentKey || !nextKey || !signature) return { ok: false, rawBody };
  try {
    const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
    await receiver.verify({ signature, body: rawBody });
    return { ok: true, rawBody };
  } catch {
    return { ok: false, rawBody };
  }
}

export async function POST(req: Request): Promise<Response> {
  const useQStash = !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

  let body: { site_id?: string };

  if (useQStash) {
    // QStash imzosi bilan autentifikatsiya
    const { ok, rawBody } = await verifyQStash(req);
    if (!ok) {
      return NextResponse.json({ error: 'QStash imzo tekshiruvi muvaffaqiyatsiz' }, { status: 401 });
    }
    try { body = JSON.parse(rawBody); } catch {
      return NextResponse.json({ error: "So'rov tanasi noto'g'ri" }, { status: 400 });
    }
  } else {
    // Fallback: CRON_SECRET orqali autentifikatsiya
    if (!isFallbackAuthorized(req)) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }
    try { body = await req.json() as { site_id?: string }; } catch {
      return NextResponse.json({ error: "So'rov tanasi noto'g'ri" }, { status: 400 });
    }
  }

  const siteId = body?.site_id;
  if (!siteId) {
    return NextResponse.json({ error: 'site_id talab qilinadi' }, { status: 400 });
  }

  try {
    const result = await processOneSite(siteId);
    return NextResponse.json({ success: true, site_id: siteId, ...result });
  } catch (err: unknown) {
    console.error(`[Worker] site=${siteId} 5xx xatosi:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ishchi xatoligi' },
      { status: 500 }
    );
  }
}
