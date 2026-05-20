import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../../../../../supabase/types';
import { VerifyWordPressConnection } from '@/lib/API/Services/wordpress/verify';
import { encryptText } from '@/lib/utils/encryption';
import { SupabaseInsertSite } from '@/lib/API/Database/sites/mutations';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Tizimga kirish talab etiladi!' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. So'rov parametrlarini olish
    const body = await request.json();
    const { url, wp_username, wp_password } = body;

    if (!url || !wp_username || !wp_password) {
      return NextResponse.json(
        { success: false, error: 'Barcha maydonlarni to\'ldirish shart!' },
        { status: 400 }
      );
    }

    // 3. Local URL uchun WP API tekshiruvini skip qil
    try {
      const hostname = new URL(url).hostname;
      const isLocal = hostname.endsWith('.local') || hostname === 'localhost' || hostname === '127.0.0.1';

      if (isLocal) {
        const encryptedPassword = encryptText(wp_password);
        const insertResult = await SupabaseInsertSite({
          user_id: userId,
          url,
          wp_username,
          wp_password: encryptedPassword,
          brand_voice: { tone: 'professional', voice_description: '', target_audience: '', rules: [] },
          publish_days: ['Monday', 'Wednesday', 'Friday'],
          publish_time: '09:00:00',
          is_active: true
        });

        if (insertResult.error) {
          return NextResponse.json({ success: false, error: 'Bazaga saqlashda xatolik' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Local sayt ulandi!', site: insertResult.data });
      }
    } catch {
      // URL parse xatosi — davom etsin
    }

    // 4. WordPress ulanishini tekshirish (remote saytlar uchun)
    const verification = await VerifyWordPressConnection(url, wp_username, wp_password);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      );
    }

    // 4. Parolni xavfsiz shifrlash
    const encryptedPassword = encryptText(wp_password);

    // 5. Sayt ulanishini bazada saqlash
    const insertResult = await SupabaseInsertSite({
      user_id: userId,
      url: url,
      wp_username: wp_username,
      wp_password: encryptedPassword,
      brand_voice: {
        voice_description: '',
        tone: 'professional',
        target_audience: 'umumiylik',
        rules: []
      },
      publish_days: ['Monday', 'Wednesday', 'Friday'],
      publish_time: '09:00:00',
      is_active: true
    });

    if (insertResult.error) {
      return NextResponse.json(
        { success: false, error: 'Ulanish muvaffaqiyatli tekshirildi, lekin bazada saqlashda xatolik yuz berdi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WordPress sayti muvaffaqiyatli tekshirildi va saqlandi!',
      site: insertResult.data
    });

  } catch (error: any) {
    console.error('WordPress verification route error:', error);
    return NextResponse.json(
      { success: false, error: 'Tizim ichki xatoligi yuz berdi.' },
      { status: 500 }
    );
  }
}
