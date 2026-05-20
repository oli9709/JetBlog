import 'server-only';

interface SendTelegramPostProps {
  chatId: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string | null;
}

const TELEGRAM_API = `https://api.telegram.org/bot`;

function buildMessage(title: string, excerpt: string, url: string): string {
  return (
    `🔥 <b>${title}</b>\n\n` +
    `${excerpt}\n\n` +
    `🔗 <a href="${url}">Batafsil o'qish</a>`
  );
}

export async function sendTelegramPost({
  chatId,
  title,
  excerpt,
  url,
  imageUrl
}: SendTelegramPostProps): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN topilmadi.');
    return false;
  }

  const text = buildMessage(title, excerpt, url);

  try {
    if (imageUrl) {
      const res = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: text,
          parse_mode: 'HTML'
        })
      });

      if (res.ok) return true;

      const err = await res.text();
      console.error('Telegram sendPhoto xatosi:', err);
      // Rasm xato bo'lsa — oddiy matn yuborishga urinamiz
    }

    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    if (res.ok) return true;

    const err = await res.text();
    console.error('Telegram sendMessage xatosi:', err);
    return false;

  } catch (error) {
    console.error('Telegram notify exception:', error);
    return false;
  }
}

export async function sendTelegramTestMessage(chatId: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ <b>JetBlog ulandi!</b>\n\nKanal muvaffaqiyatli bog\'landi. Endi yangi maqolalar avtomatik anons qilinadi.',
        parse_mode: 'HTML'
      })
    });

    return res.ok;
  } catch {
    return false;
  }
}
