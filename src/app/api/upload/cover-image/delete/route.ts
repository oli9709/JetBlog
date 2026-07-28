import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';

const Body = z.object({ articleId: z.string().uuid() });

const BUCKET = 'article-images';
const STORAGE_URL_MARKER = '/storage/v1/object/public/article-images/';

function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const idx = url.indexOf(STORAGE_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + STORAGE_URL_MARKER.length);
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.uploads, async () => {
    try {
      const supabase = await SupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const parsed = Body.safeParse(await req.json().catch(() => ({})));
      if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
      const { articleId } = parsed.data;

      const svc = serviceClient();

      const { data: article, error: articleErr } = await svc
        .from('articles')
        .select('id, featured_image_url, sites!inner(user_id)')
        .eq('id', articleId)
        .single();

      if (articleErr || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      const ownerId = (article as unknown as { sites: { user_id: string } }).sites?.user_id;
      if (ownerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Storage'да bo'lsa o'chir (tashqi URL bo'lsa — tegmaymiz)
      const storagePath = extractStoragePath(article.featured_image_url);
      if (storagePath) {
        const { error: rmErr } = await svc.storage.from(BUCKET).remove([storagePath]);
        if (rmErr) console.warn('[upload/cover/delete] storage remove failed', rmErr.message);
      }

      const { error: dbErr } = await svc
        .from('articles')
        .update({ featured_image_url: null })
        .eq('id', articleId);
      if (dbErr) {
        return NextResponse.json({ error: 'Failed to clear image reference' }, { status: 500 });
      }

      console.log('[upload/cover/delete] success', { userId: user.id, articleId, hadStorageFile: !!storagePath });
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      console.error('[upload/cover/delete] unexpected exception', { message: err?.message });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
