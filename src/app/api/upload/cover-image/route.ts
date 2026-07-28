import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseServerClient } from '@/lib/API/Services/init/supabase';
import { withRateLimit } from '@/lib/withRateLimit';
import { rateLimiters } from '@/lib/ratelimit';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const BUCKET = 'article-images';
const STORAGE_URL_MARKER = '/storage/v1/object/public/article-images/';

function detectMimeFromMagic(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return 'image/png';
  // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP at offset 8)
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return 'image/webp';
  return null;
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Storage URL dan `<userId>/<filename>` path'ni chiqarib olish.
 * Faqat bizning bucket URL bo'lsa ishlaydi, aks holda null.
 */
function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const idx = url.indexOf(STORAGE_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + STORAGE_URL_MARKER.length);
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimiters.uploads, async () => {
    try {
      // 1. Auth
      const supabase = await SupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // 2. FormData
      const form = await req.formData();
      const file = form.get('file');
      const articleId = form.get('articleId');

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }
      if (typeof articleId !== 'string' || !articleId) {
        return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
      }

      // 3. Size + MIME
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 });
      }
      if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
      }

      // 4. Magic bytes (declared MIME can be spoofed)
      const bytes = new Uint8Array(await file.arrayBuffer());
      const detected = detectMimeFromMagic(bytes);
      if (!detected) {
        return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
      }
      if (detected !== file.type) {
        return NextResponse.json(
          { error: `Declared type ${file.type} does not match file content (${detected})` },
          { status: 400 }
        );
      }

      const svc = serviceClient();

      // 5. Ownership check — article must belong to a site owned by user
      const { data: article, error: articleErr } = await svc
        .from('articles')
        .select('id, featured_image_url, site_id, sites!inner(user_id)')
        .eq('id', articleId)
        .single();

      if (articleErr || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      const ownerId = (article as unknown as { sites: { user_id: string } }).sites?.user_id;
      if (ownerId !== user.id) {
        console.warn('[upload/cover] ownership mismatch', { userId: user.id, articleId, ownerId });
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // 6. Delete previous image if it lives in our bucket (quota save)
      const oldPath = extractStoragePath(article.featured_image_url);
      if (oldPath) {
        const { error: rmErr } = await svc.storage.from(BUCKET).remove([oldPath]);
        if (rmErr) console.warn('[upload/cover] old image remove failed (non-fatal)', rmErr.message);
      }

      // 7. Upload — path prefix = userId (matches RLS policy)
      const ext = MIME_EXT[detected] ?? 'bin';
      const path = `${user.id}/${articleId}-${Date.now()}.${ext}`;
      const { error: upErr } = await svc.storage
        .from(BUCKET)
        .upload(path, bytes, {
          contentType: detected,
          upsert: false,
          cacheControl: '31536000, immutable',
        });
      if (upErr) {
        console.error('[upload/cover] storage upload failed', { path, message: upErr.message });
        return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
      }

      // 8. Public URL + DB update
      const publicUrl = svc.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const { error: dbErr } = await svc
        .from('articles')
        .update({ featured_image_url: publicUrl })
        .eq('id', articleId);
      if (dbErr) {
        console.error('[upload/cover] db update failed', { articleId, message: dbErr.message });
        // Try to clean up the uploaded file to avoid orphans
        await svc.storage.from(BUCKET).remove([path]).catch(() => {});
        return NextResponse.json({ error: 'Failed to save image reference' }, { status: 500 });
      }

      console.log('[upload/cover] success', {
        userId: user.id,
        articleId,
        path,
        size: file.size,
      });

      return NextResponse.json({ url: publicUrl });
    } catch (err: any) {
      console.error('[upload/cover] unexpected exception', {
        message: err?.message,
        stack: err?.stack?.split('\n').slice(0, 3).join(' | '),
      });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
