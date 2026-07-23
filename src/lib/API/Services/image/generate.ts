import { createClient } from '@supabase/supabase-js';
import { getGeminiClient, isGeminiConfigured } from '../init/gemini';

interface GenerateImagePropsI {
  keyword: string;
  title: string;
  language?: string;
  /** Ixtiyoriy — shu sayt uchun oxirgi 90 kunlik rasm URL'lar chetlab o'tiladi. */
  siteId?: string;
}

// Kalit so'zdan Pexels uchun 2-3 so'zli inglizcha qidiruv so'rovi
async function buildImageQuery(keyword: string): Promise<string> {
  if (!isGeminiConfigured()) return keyword;
  try {
    const genai = getGeminiClient();
    const model = process.env.VERTEX_GEMINI_MODEL || 'gemini-2.5-flash';
    const res = await genai.models.generateContent({
      model,
      contents: `Convert this blog topic into a 2-3 word English stock-photo search query (nouns only, no punctuation): "${keyword}". Reply with ONLY the query.`,
      config: { maxOutputTokens: 20, temperature: 0.2 },
    });
    const q = (res.text ?? '').trim().replace(/["'.\n]/g, ' ').replace(/\s+/g, ' ').trim();
    return q || keyword;
  } catch {
    return keyword;
  }
}

/** Oxirgi 90 kun ichida shu sayt uchun ishlatilgan featured_image URL'larni oladi. */
async function getRecentImageUrls(siteId: string): Promise<Set<string>> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return new Set();
    const svc = createClient(url, key);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await svc
      .from('articles')
      .select('featured_image_url')
      .eq('site_id', siteId)
      .not('featured_image_url', 'is', null)
      .gte('created_at', ninetyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(100);
    return new Set(
      (data ?? [])
        .map((r) => r.featured_image_url as string | null)
        .filter((v): v is string => !!v)
    );
  } catch (err) {
    console.warn('[image] recent URLs lookup failed (non-fatal):', err);
    return new Set();
  }
}

async function fetchPexelsPage(
  apiKey: string,
  query: string,
  page: number,
  perPage: number
): Promise<Array<{ src?: { landscape?: string; large?: string } }>> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    console.error('[image] Pexels xatosi:', res.status);
    return [];
  }
  const data = (await res.json()) as { photos?: Array<{ src?: { landscape?: string; large?: string } }> };
  return data.photos ?? [];
}

export const GenerateCoverImage = async ({
  keyword,
  siteId,
}: GenerateImagePropsI): Promise<string | null> => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[image] PEXELS_API_KEY topilmadi, rasm o'tkazib yuborildi.");
    return null;
  }

  try {
    const query = await buildImageQuery(keyword);
    console.log('[image] Pexels qidiruvi:', { query, siteId });

    // 1. Ilgari ishlatilgan URL'lar (siteId berilgan bo'lsa)
    const used = siteId ? await getRecentImageUrls(siteId) : new Set<string>();

    // 2. Birinchi sahifa — 30 ta
    let photos = await fetchPexelsPage(apiKey, query, 1, 30);
    let filtered = photos.filter(
      (p) => !used.has(p.src?.landscape ?? '') && !used.has(p.src?.large ?? '')
    );

    // 3. Agar hech nima qolmasa, ikkinchi sahifani ham sinab ko'ramiz
    if (filtered.length === 0 && photos.length > 0) {
      const page2 = await fetchPexelsPage(apiKey, query, 2, 30);
      photos = [...photos, ...page2];
      filtered = photos.filter(
        (p) => !used.has(p.src?.landscape ?? '') && !used.has(p.src?.large ?? '')
      );
    }

    // 4. Fallback — hech qanday yangi rasm bo'lmasa, warning + oxirgi chora sifatida takrorlash
    if (filtered.length === 0) {
      if (photos.length === 0) {
        console.warn("[image] Pexels natija yo'q:", query);
        return null;
      }
      console.warn('[image] barcha natijalar allaqachon ishlatilgan, fallback:', {
        siteId,
        query,
        photoCount: photos.length,
      });
      filtered = photos;
    }

    // Xilma-xillik uchun tepadagi natijalardan tasodifiy bittasi
    const pick = filtered[Math.floor(Math.random() * Math.min(filtered.length, 15))];
    return pick?.src?.landscape ?? pick?.src?.large ?? null;
  } catch (error) {
    console.error('[image] Pexels rasm olishda xatolik:', error);
    return null;
  }
};
