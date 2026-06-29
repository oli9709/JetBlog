import { NextResponse } from 'next/server';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';

export const dynamic = 'force-dynamic';

function countWords(html: string): number {
  const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  const empty = {
    totalArticles: 0, publishedThisMonth: 0, publishedThisWeek: 0,
    avgWordsPerArticle: 0,
    topKeywords: [] as { keyword: string; count: number }[],
    publishHistory: [] as { date: string; count: number }[],
  };
  if (!siteId) return NextResponse.json(empty);

  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(empty, { status: 401 });

  // Sayt foydalanuvchiga tegishli ekanini tekshirish
  const { data: site } = await supabase
    .from('sites').select('id').eq('id', siteId).eq('user_id', user.id).single();
  if (!site) return NextResponse.json(empty, { status: 403 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [totalRes, monthRes, weekRes, contentRes, last30Res, kwRes, artKwRes] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('site_id', siteId).gte('created_at', monthStart),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('site_id', siteId).gte('created_at', weekStart),
    supabase.from('articles').select('content').eq('site_id', siteId),
    supabase.from('articles').select('created_at').eq('site_id', siteId).gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    supabase.from('keywords').select('id, keyword').eq('site_id', siteId),
    supabase.from('articles').select('keyword_id').eq('site_id', siteId),
  ]);

  // O'rtacha so'z soni (HTML tozalanadi)
  const contents = (contentRes.data ?? []) as { content: string | null }[];
  let avgWordsPerArticle = 0;
  if (contents.length > 0) {
    const total = contents.reduce((s, a) => s + countWords(a.content ?? ''), 0);
    avgWordsPerArticle = Math.round(total / contents.length);
  }

  // Top kalit so'zlar (maqola soni bo'yicha)
  const kwById: Record<string, string> = {};
  for (const k of (kwRes.data ?? []) as { id: string; keyword: string }[]) kwById[k.id] = k.keyword;
  const kwCount: Record<string, number> = {};
  for (const a of (artKwRes.data ?? []) as { keyword_id: string | null }[]) {
    if (a.keyword_id && kwById[a.keyword_id]) kwCount[a.keyword_id] = (kwCount[a.keyword_id] ?? 0) + 1;
  }
  const topKeywords = Object.entries(kwCount)
    .map(([id, count]) => ({ keyword: kwById[id], count }))
    .sort((a, b) => b.count - a.count).slice(0, 7);

  // Oxirgi 30 kun — kunlik publish tarixi (DD.MM)
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of (last30Res.data ?? []) as { created_at: string | null }[]) {
    if (row.created_at) { const key = row.created_at.slice(0, 10); if (key in dayMap) dayMap[key] += 1; }
  }
  const publishHistory = Object.entries(dayMap).map(([date, count]) => ({
    date: `${date.slice(8, 10)}.${date.slice(5, 7)}`, count,
  }));

  return NextResponse.json({
    totalArticles: totalRes.count ?? 0,
    publishedThisMonth: monthRes.count ?? 0,
    publishedThisWeek: weekRes.count ?? 0,
    avgWordsPerArticle, topKeywords, publishHistory,
  });
}
