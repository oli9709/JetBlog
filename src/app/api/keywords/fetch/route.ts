import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { fetchKeywordData } from '@/lib/API/Services/keywords/fetch';

/**
 * POST /api/keywords/fetch
 * DataForSEO yoki boshqa SEO xizmatlari yordamida kalit so'z bo'yicha Search Volume va Difficulty ma'lumotlarini olish
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    
    // Foydalanuvchi seansini tekshirish
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const { keyword, language } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'keyword parametri talab qilinadi!' }, { status: 400 });
    }

    const lang = language || 'uz';

    const seoData = await fetchKeywordData(keyword, lang);

    return NextResponse.json({
      success: true,
      keyword: keyword,
      language: lang,
      searchVolume: seoData.search_volume,
      difficulty: seoData.difficulty,
      trend: seoData.trend
    });

  } catch (error: any) {
    console.error('Keywords Fetch Route Global Error:', error);
    return NextResponse.json({ error: error.message || 'Tizimda kutilmagan xatolik yuz berdi.' }, { status: 500 });
  }
}
