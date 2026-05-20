import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await adminClient
      .from('profiles').select('is_admin').eq('id', session.user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, credits } = await req.json();
    if (!userId || !credits || credits <= 0) {
      return NextResponse.json({ error: 'userId va musbat credits talab qilinadi' }, { status: 400 });
    }

    const { data: target } = await adminClient
      .from('profiles').select('credits_remaining').eq('id', userId).single();

    const newTotal = (target?.credits_remaining || 0) + credits;
    const { error } = await adminClient
      .from('profiles').update({ credits_remaining: newTotal }).eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    console.log(`[Admin] Added ${credits} credits to ${userId}. New total: ${newTotal}`);
    return NextResponse.json({ success: true, newTotal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
