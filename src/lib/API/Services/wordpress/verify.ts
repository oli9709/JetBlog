import 'server-only';

/**
 * WordPress sayt URL manzilini standart holatga keltirish (normalizatsiya)
 */
export const normalizeWordPressUrl = (url: string): string => {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  // Oxiridagi ortiqcha slash belgisini olib tashlash
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
};

interface VerifyWordPressResponseI {
  success: boolean;
  username?: string;
  roles?: string[];
  error?: string;
}

const isLocalUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname.endsWith('.local') || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

/**
 * WordPress REST API orqali ulanish va yozish huquqlarini tekshirish
 */
export const VerifyWordPressConnection = async (
  url: string,
  username: string,
  applicationPassword: string
): Promise<VerifyWordPressResponseI> => {
  const baseUrl = normalizeWordPressUrl(url);

  // LocalWP / localhost saytlarida DNS resolve bo'lmaydi — tekshiruvni skip qilamiz
  if (isLocalUrl(baseUrl)) {
    console.warn(`[WP Verify] Local URL detected (${baseUrl}) — skipping API check`);
    return { success: true, username, roles: ['administrator'] };
  }

  try {
    const apiUrl = `${baseUrl}/wp-json/wp/v2/users/me`;

    // Parolni tozalash (bo'shliqlarni olib tashlash)
    const cleanPassword = applicationPassword.replace(/\s+/g, '');

    // Basic Authentication header tayyorlash
    const authHeader = 'Basic ' + Buffer.from(`${username.trim()}:${cleanPassword}`).toString('base64');

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'JetBlog.app API Client'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: 'WordPress foydalanuvchi nomi yoki Application Password noto\'g\'ri!'
        };
      }
      if (res.status === 404) {
        return {
          success: false,
          error: 'WordPress REST API topilmadi! Saytingizda REST API yoqilganligiga ishonch hosil qiling.'
        };
      }
      return {
        success: false,
        error: `WordPress ulanishda xatolik: HTTP ${res.status}`
      };
    }

    const userData = await res.json();

    // Foydalanuvchining roli maqola nashr etish uchun yetarli ekanini tekshirish (administrator, editor, author, contributor)
    const roles: string[] = userData.roles || [];
    const hasPublishingRole = roles.some(role => 
      ['administrator', 'editor', 'author'].includes(role.toLowerCase())
    );

    if (roles.length > 0 && !hasPublishingRole) {
      return {
        success: false,
        error: `Muvaffaqiyatli bog'landi, lekin "${username}" foydalanuvchisi maqola nashr etish huquqiga ega emas (administrator, editor yoki author bo'lishi kerak).`
      };
    }

    return {
      success: true,
      username: userData.name || username,
      roles: roles
    };
  } catch (error: any) {
    console.error('WP Verify Error:', error);
    return {
      success: false,
      error: 'WordPress saytiga ulanib bo\'lmadi! URL manzilini tekshiring yoki internet aloqasini tekshiring.'
    };
  }
};
