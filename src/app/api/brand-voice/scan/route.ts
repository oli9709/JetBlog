import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as cheerio from 'cheerio';
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

async function analyzeWithGemini(
  extracted: {
    title: string;
    description: string;
    siteName: string;
    h1: string;
    bodyText: string;
  },
  targetLanguage?: 'uz' | 'en'
): Promise<ScanResult> {
  const genai = getGeminiClient();
  const model = process.env.VERTEX_GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = `You are a brand-voice analyst. Analyze the website content and return ONLY a JSON object — no markdown, no code fences, no commentary.

Schema:
{
  "voice_description": string (2-3 sentences describing the brand style),
  "tone": "professional" | "friendly" | "casual" | "authoritative",
  "target_audience": string[] (2-4 items),
  "language": "uz" | "en" | "ru",
  "always_use": string[] (3-5 keywords/phrases to always include),
  "never_use": string[] (2-3 words/phrases to avoid)
}

${targetLanguage ? `The user has requested output in ${targetLanguage === 'uz' ? "O'zbek (uz)" : 'English (en)'}. Set language to that value and write voice_description in that language.` : 'Detect the language automatically from the content.'}`;

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
      maxOutputTokens: 800,
      temperature: 0.4,
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const text = (res.text ?? '').trim();
  let parsed: ScanResult;
  try {
    parsed = JSON.parse(text) as ScanResult;
  } catch {
    // JSON boshi/oxirida markdown fence bo'lsa tozalaymiz
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleaned) as ScanResult;
  }

  // Fallback / defaults
  if (!parsed.tone) parsed.tone = 'professional';
  if (!parsed.language) parsed.language = targetLanguage ?? 'en';
  if (!Array.isArray(parsed.target_audience)) parsed.target_audience = [];
  if (!Array.isArray(parsed.always_use)) parsed.always_use = [];
  if (!Array.isArray(parsed.never_use)) parsed.never_use = [];

  console.log('[brand-scan] tokens', {
    input: res.usageMetadata?.promptTokenCount,
    output: res.usageMetadata?.candidatesTokenCount,
  });

  return parsed;
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
      let result: ScanResult;
      try {
        result = await analyzeWithGemini(extracted, targetLanguage);
      } catch (err: any) {
        console.error('[brand-scan] analyze failed', { url: parsedUrl.origin, message: err?.message });
        return NextResponse.json({ error: 'Analysis failed, try again' }, { status: 500 });
      }

      console.log('[brand-scan] done', {
        url: parsedUrl.origin,
        tone: result.tone,
        language: result.language,
      });

      return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
      console.error('[brand-scan] unexpected error', { message: err?.message });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
