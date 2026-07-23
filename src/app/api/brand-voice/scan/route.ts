import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { Type } from '@google/genai';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';
import { getGeminiClient, isGeminiConfigured } from '@/lib/API/Services/init/gemini';

const Body = z.object({
  url: z.string().url(),
  targetLanguage: z.enum(['uz', 'en']).optional(),
});

interface ScanResult {
  voice_description: string;
  tone: 'professional' | 'friendly' | 'casual' | 'authoritative';
  target_audience: string[];
  language: 'uz' | 'en' | 'ru';
  always_use: string[];
  never_use: string[];
}

// Xavfli localhost / private IP'lar
function isDangerousHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1') return true;
  if (h.startsWith('127.')) return true;
  if (h.startsWith('10.')) return true;
  if (h.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h.startsWith('169.254.')) return true;
  return false;
}

async function fetchAndParse(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'JetBlogBot/1.0 (+https://jetblog.app)',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15_000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Site returned ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').first().text().trim();
  const description =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';
  const siteName = $('meta[property="og:site_name"]').attr('content')?.trim() || '';
  const h1 = $('h1').first().text().trim();

  const paragraphs: string[] = [];
  $('p').slice(0, 20).each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t.length > 20) paragraphs.push(t);
  });
  const bodyText = paragraphs.join(' ').slice(0, 3000);

  return { title, description, siteName, h1, bodyText };
}

const TONES = ['professional', 'friendly', 'casual', 'authoritative'] as const;
const LANGS = ['uz', 'en', 'ru'] as const;

/** Gemini structured-output schema — model'ni qat'iy JSON qайtarishga majbur qiladi. */
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    'voice_description',
    'tone',
    'target_audience',
    'language',
    'always_use',
    'never_use',
  ],
  properties: {
    voice_description: { type: Type.STRING },
    tone: { type: Type.STRING, enum: [...TONES] },
    target_audience: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: '1',
      maxItems: '5',
    },
    language: { type: Type.STRING, enum: [...LANGS] },
    always_use: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      maxItems: '8',
    },
    never_use: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      maxItems: '5',
    },
  },
};

async function analyzeWithGemini(
  extracted: {
    title: string;
    description: string;
    siteName: string;
    h1: string;
    bodyText: string;
  },
  targetLanguage?: 'uz' | 'en'
): Promise<{ ok: true; data: ScanResult } | { ok: false; error: string; details?: unknown }> {
  const genai = getGeminiClient();
  const model = process.env.VERTEX_GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = `You are analyzing a website to extract brand voice characteristics.
Return ONLY a valid JSON object matching this exact structure. Do not add markdown, code fences, explanations, or any text outside the JSON.

Fields:
- voice_description: 2-3 sentences describing the brand's writing style
- tone: exactly one of 'professional', 'friendly', 'casual', 'authoritative'
- target_audience: 2-4 short audience segments (e.g. 'small business owners')
- language: 'uz', 'en', or 'ru' based on the website's primary language
- always_use: 3-5 key phrases/keywords the brand emphasizes
- never_use: 2-3 words/phrases the brand should avoid

If the site content is empty or unreadable, still return valid JSON with your best educated guess based on the URL and any available metadata.${targetLanguage ? `\n\nThe user has requested output in ${targetLanguage === 'uz' ? "O'zbek (uz)" : 'English (en)'}. Set language to "${targetLanguage}" and write voice_description in that language.` : ''}`;

  const content = [
    `Site: ${extracted.siteName || '(unknown)'}`,
    `Title: ${extracted.title}`,
    `Description: ${extracted.description}`,
    `H1: ${extracted.h1}`,
    `Body: ${extracted.bodyText}`,
  ].join('\n');

  const res = await genai.models.generateContent({
    model,
    contents: content,
    config: {
      systemInstruction,
      maxOutputTokens: 800,
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  console.log('[brand-scan] tokens', {
    input: res.usageMetadata?.promptTokenCount,
    output: res.usageMetadata?.candidatesTokenCount,
  });

  // ── Defensive parsing ─────────────────────────────────────────────
  let text = (res.text ?? '').trim();

  // Markdown code fence tozalash (agar bor bo'lsa)
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // JSON blokini qidirish (matn oldida-keyin qo'shimcha bo'lsa)
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  if (!text) {
    return { ok: false, error: 'AI returned empty response. Please try again.' };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch (e) {
    return {
      ok: false,
      error: 'AI response format was invalid. Please try again.',
      details: {
        textPreview: text.slice(0, 200),
        parseError: e instanceof Error ? e.message : String(e),
      },
    };
  }

  // Muhim maydonlarni validate + fallback
  const toneRaw = parsed.tone as string | undefined;
  const langRaw = parsed.language as string | undefined;

  const result: ScanResult = {
    voice_description:
      typeof parsed.voice_description === 'string' ? parsed.voice_description : '',
    tone:
      toneRaw && (TONES as readonly string[]).includes(toneRaw)
        ? (toneRaw as ScanResult['tone'])
        : 'professional',
    target_audience: Array.isArray(parsed.target_audience)
      ? (parsed.target_audience as unknown[])
          .filter((x): x is string => typeof x === 'string')
          .slice(0, 5)
      : [],
    language:
      langRaw && (LANGS as readonly string[]).includes(langRaw)
        ? (langRaw as ScanResult['language'])
        : (targetLanguage ?? 'en'),
    always_use: Array.isArray(parsed.always_use)
      ? (parsed.always_use as unknown[])
          .filter((x): x is string => typeof x === 'string')
          .slice(0, 8)
      : [],
    never_use: Array.isArray(parsed.never_use)
      ? (parsed.never_use as unknown[])
          .filter((x): x is string => typeof x === 'string')
          .slice(0, 5)
      : [],
  };

  if (!result.voice_description) {
    return {
      ok: false,
      error: 'Could not extract brand voice from this site. Try a different URL.',
      details: { parsed },
    };
  }

  return { ok: true, data: result };
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.brandScan, async () => {
    try {
      const supabase = await SupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const parsed = Body.safeParse(await req.json().catch(() => ({})));
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
      }
      const { url: rawUrl, targetLanguage } = parsed.data;

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Only http/https URLs are allowed' }, { status: 400 });
      }
      if (isDangerousHost(parsedUrl.hostname)) {
        return NextResponse.json({ error: 'Private / local URLs are not allowed' }, { status: 400 });
      }

      if (!isGeminiConfigured()) {
        return NextResponse.json({ error: 'AI is not configured on the server' }, { status: 503 });
      }

      console.log('[brand-scan] start', { userId: user.id, url: parsedUrl.origin });

      // 1. Fetch + parse
      let extracted;
      try {
        extracted = await fetchAndParse(parsedUrl.toString());
      } catch (err: any) {
        console.error('[brand-scan] fetch failed', { url: parsedUrl.origin, message: err?.message });
        return NextResponse.json(
          { error: `Couldn't reach the site (${err?.message ?? 'unknown'})` },
          { status: 502 }
        );
      }

      // 2. Analyze
      let analysis: Awaited<ReturnType<typeof analyzeWithGemini>>;
      try {
        analysis = await analyzeWithGemini(extracted, targetLanguage);
      } catch (err: any) {
        console.error('[brand-scan] analyze threw', { url: parsedUrl.origin, message: err?.message });
        return NextResponse.json({ error: 'Analysis failed, try again' }, { status: 500 });
      }

      if (analysis.ok === false) {
        console.error('[brand-scan] analyze rejected', {
          url: parsedUrl.origin,
          error: analysis.error,
          details: analysis.details,
        });
        return NextResponse.json({ error: analysis.error }, { status: 500 });
      }

      console.log('[brand-scan] success', {
        url: parsedUrl.origin,
        tone: analysis.data.tone,
        lang: analysis.data.language,
      });

      return NextResponse.json({ success: true, data: analysis.data });
    } catch (err: any) {
      console.error('[brand-scan] unexpected error', { message: err?.message });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
