import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendWebhook } from '@/lib/API/Services/webhook/send';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<any>({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
