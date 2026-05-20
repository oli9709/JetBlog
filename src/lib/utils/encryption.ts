import crypto from 'crypto';

const VAULT_KEY = process.env.SUPABASE_VAULT_KEY || 'default_vault_secret_key_32_chars_long_jetblog';

// AES-256-GCM — yangi format (3 qism: iv:authTag:encrypted)
const GCM_ALGORITHM = 'aes-256-gcm';
// AES-256-CBC — eski format (2 qism: iv:encrypted), backward compat uchun
const CBC_ALGORITHM = 'aes-256-cbc';

const getKey = (): Buffer => crypto.createHash('sha256').update(VAULT_KEY).digest();

export const encryptText = (text: string): string => {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(GCM_ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

export const decryptText = (encryptedText: string): string => {
  if (!encryptedText) return '';

  try {
    const parts = encryptedText.split(':');
    const key = getKey();

    if (parts.length === 3) {
      // Yangi GCM format
      const iv = Buffer.from(parts[0], 'hex');
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

    // Format noto'g'ri — oddiy matn bo'lishi mumkin
    return encryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
