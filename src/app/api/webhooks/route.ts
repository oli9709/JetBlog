import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('webhooks')
    .select('id, endpoint_url, events, is_active, last_status, last_triggered_at, retry_count, created_at, site_id')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, webhooks: data });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { site_id, endpoint_url, events } = await req.json();
  if (!site_id || !endpoint_url) {
    return NextResponse.json({ error: 'site_id va endpoint_url talab qilinadi' }, { status: 400 });
  }

  // Foydalanuvchi bu saytga ega ekanligini tekshirish
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', site_id)
    .eq('user_id', session.user.id)
    .single();

  if (!site) return NextResponse.json({ error: 'Sayt topilmadi' }, { status: 404 });

  const secret_key = crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      site_id,
      endpoint_url,
      secret_key,
      events: events || ['article.published']
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, webhook: data });
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'id talab qilinadi' }, { status: 400 });

  // Faqat ruxsat etilgan maydonlarni yangilash
  const allowed = ['source_platform', 'prompt_generated_at', 'connection_tested', 'is_active'];
  const update: Record<string, any> = {};
  for (const key of allowed) {
    if (key in fields) update[key] = fields[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Yangilanadigan maydon yo\'q' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('webhooks')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, webhook: data });
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id talab qilinadi' }, { status: 400 });

  const { error } = await supabase.from('webhooks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
