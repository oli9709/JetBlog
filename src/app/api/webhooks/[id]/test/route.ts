import { NextResponse } from 'next/server';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { sendWebhook } from '@/lib/API/Services/webhook/send';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await SupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: webhook } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .single();

  if (!webhook) return NextResponse.json({ error: 'Webhook topilmadi' }, { status: 404 });

  const result = await sendWebhook({
    webhookId: webhook.id,
    endpointUrl: webhook.endpoint_url,
    secretKey: webhook.secret_key,
    event: 'article.test',
    payload: {
      title: 'Test maqola — JetBlog.ai',
      content: '<p>Bu JetBlog.ai webhook tizimidan yuborilgan test payload.</p>',
      excerpt: 'Bu JetBlog.ai webhook tizimidan yuborilgan test payload.',
      featured_image_url: null,
      keyword: 'test keyword',
      language: 'uz'
    }
  });

  return NextResponse.json({
    success: result.success,
    status: result.status,
    message: result.success ? 'Test muvaffaqiyatli yuborildi!' : `Xatolik: HTTP ${result.status}`
  });
}
