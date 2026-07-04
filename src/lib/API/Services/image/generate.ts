import { getGeminiClient, isGeminiConfigured } from '../init/gemini';

interface GenerateImagePropsI {
  keyword: string;
  title: string;
  language?: string;
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

export const GenerateCoverImage = async ({
  keyword,
}: GenerateImagePropsI): Promise<string | null> => {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('[image] PEXELS_API_KEY topilmadi, rasm o\'tkazib yuborildi.');
    return null;
  }

  try {
    const query = await buildImageQuery(keyword);
    console.log('[image] Pexels qidiruvi:', query);

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error('[image] Pexels xatosi:', res.status);
      return null;
    }

    const data = (await res.json()) as { photos?: Array<{ src?: { landscape?: string; large?: string } }> };
    const photos = data.photos ?? [];
    if (photos.length === 0) {
      console.warn('[image] Pexels natija yo\'q:', query);
      return null;
    }

    // Xilma-xillik uchun tepadagi natijalardan tasodifiy bittasi
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 10))];
    return pick?.src?.landscape ?? pick?.src?.large ?? null;
  } catch (error) {
    console.error('[image] Pexels rasm olishda xatolik:', error);
    return null;
  }
};
