import crypto from 'crypto';

// ── Fail-fast: SUPABASE_VAULT_KEY bo'sh yoki qisqa bo'lsa server ishga tushmaydi ──
const RAW_KEY = process.env.SUPABASE_VAULT_KEY ?? '';
if (!RAW_KEY || RAW_KEY.length < 32) {
  throw new Error(
    '[JetBlog] SUPABASE_VAULT_KEY muhit o\'zgaruvchisi yo\'q yoki 32 belgidan qisqa. ' +
    'Ishga tushishdan oldin .env.local ga eng kamida 32 belgili tasodifiy kalit qo\'ying.\n' +
    'Misol: openssl rand -hex 32'
  );
}

// AES-256-GCM — yangi format (3 qism: iv:authTag:encrypted)
const GCM_ALGORITHM = 'aes-256-gcm';
// AES-256-CBC — eski format (2 qism: iv:encrypted), backward compat uchun
const CBC_ALGORITHM = 'aes-256-cbc';

const getKey = (): Buffer => crypto.createHash('sha256').update(RAW_KEY).digest();

/**
 * Matnni AES-256-GCM bilan shifrlaydi.
 * Xato bo'lsa HECH QACHON oddiy matni qaytarmaydi — xatoni tashlaydi.
 */
export const encryptText = (text: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(GCM_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Shifrlangan matnni ochadi (GCM yoki CBC backward-compat).
 *
 * @throws {CredentialDecryptError} — kalit noto'g'ri yoki ma'lumot buzilgan bo'lsa.
 *   Murojaat qiluvchi "Saytni qayta ulang" degan xabar ko'rsatishi kerak.
 */
export class CredentialDecryptError extends Error {
  constructor(cause?: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Credential decryption failed: ${detail}`);
    this.name = 'CredentialDecryptError';
  }
}

export const decryptText = (encryptedText: string): string => {
  // Bo'sh matn — ba'zi maydonlar qonuniy ravishda bo'sh bo'lishi mumkin
  if (!encryptedText) return '';

  const parts = encryptedText.split(':');
  const key = getKey();

  try {
    if (parts.length === 3) {
      // Yangi GCM format
      const iv      = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(GCM_ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    if (parts.length === 2) {
      // Eski CBC format — backward compatibility
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(CBC_ALGORITHM, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // `:` ajratuvchisi yo'q → bu matn hali shifrlanmagan (migration davri uchun)
    // Bu holat faqat eskidan saqlanган plaintext adapter_config lar uchun qabul qilinadi.
    // Backfill script ishlagach bu yo'l yopiladi.
    return encryptedText;
  } catch (err: unknown) {
    throw new CredentialDecryptError(err);
  }
};
