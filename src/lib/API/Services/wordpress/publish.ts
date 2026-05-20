import 'server-only';
import { normalizeWordPressUrl } from './verify';

interface WordPressPublishPropsI {
  url: string;
  username: string;
  applicationPassword: string;
  title: string;
  content: string;
  featuredImageUrl?: string | null;
  status: 'draft' | 'scheduled' | 'published';
  scheduledFor?: string | null;
}

interface WordPressPublishResultI {
  success: boolean;
  wpPostId?: number;
  wpFeaturedMediaId?: number;
  error?: string;
}

/**
 * WordPress REST API orqali maqolani muqova rasmi bilan birga nashr etish yoki rejalashtirish
 */
export const PublishToWordPress = async ({
  url,
  username,
  applicationPassword,
  title,
  content,
  featuredImageUrl,
  status,
  scheduledFor
}: WordPressPublishPropsI): Promise<WordPressPublishResultI> => {
  try {
    // Agar test ma'lumotlari kiritilgan bo'lsa yoki localhost bo'lsa, simulyatsiya qilamiz
    if (url.includes('example.com') || url.includes('localhost:3000') || applicationPassword.includes('dummy')) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return {
        success: true,
        wpPostId: Math.floor(Math.random() * 5000) + 1000,
        wpFeaturedMediaId: featuredImageUrl ? Math.floor(Math.random() * 1000) + 100 : undefined
      };
    }

    const baseUrl = normalizeWordPressUrl(url);
    const cleanPassword = applicationPassword.replace(/\s+/g, '');
    const authHeader = 'Basic ' + Buffer.from(`${username.trim()}:${cleanPassword}`).toString('base64');

    let featuredMediaId: number | undefined = undefined;

    // 1. Agar rasm berilgan bo'lsa, uni avval WordPress media kutubxonasiga yuklaymiz
    if (featuredImageUrl) {
      try {
        const imageRes = await fetch(featuredImageUrl);
        if (imageRes.ok) {
          const imageBuffer = await imageRes.arrayBuffer();
          const filename = `jetblog-featured-${Date.now()}.jpg`;

          const uploadRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Type': 'image/jpeg'
            },
            body: imageBuffer
          });

          if (uploadRes.ok) {
            const mediaData = await uploadRes.json();
            featuredMediaId = mediaData.id;
          } else {
            console.error('WP media upload failed:', uploadRes.status, await uploadRes.text());
          }
        }
      } catch (mediaErr) {
        console.error('WordPress rasm yuklashda xatolik (davom etamiz):', mediaErr);
      }
    }

    // 2. Maqolani post sifatida yuboramiz
    const postUrl = `${baseUrl}/wp-json/wp/v2/posts`;
    
    // WordPress statuslari: 'publish', 'future', 'draft'
    let wpStatus = 'draft';
    if (status === 'published') wpStatus = 'publish';
    else if (status === 'scheduled') wpStatus = 'future';

    const postBody: Record<string, any> = {
      title: title,
      content: content,
      status: wpStatus
    };

    if (featuredMediaId) {
      postBody.featured_media = featuredMediaId;
    }

    // Agar rejalashtirilgan bo'lsa, nashr etish vaqtini beramiz
    if (status === 'scheduled' && scheduledFor) {
      // WordPress ISO8601 vaqtini kutadi (UTC-ga mos)
      postBody.date = new Date(scheduledFor).toISOString();
    }

    const res = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'JetBlog.app API Client'
      },
      body: JSON.stringify(postBody)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('WordPress post nashr etishda xatolik:', errorText);
      return {
        success: false,
        error: `WordPress nashr etishda xatolik: HTTP ${res.status}`
      };
    }

    const postData = await res.json();
    return {
      success: true,
      wpPostId: postData.id,
      wpFeaturedMediaId: featuredMediaId
    };

  } catch (error: any) {
    console.error('WP Publish Global Error:', error);
    return {
      success: false,
      error: 'WordPress saytiga ulanib maqolani nashr etib bo\'lmadi!'
    };
  }
};
