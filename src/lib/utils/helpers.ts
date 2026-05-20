// place helper utility functions here.

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 1. Kredit formatlash
 * @param n Kreditlar soni
 * @returns "N ta maqola" formatidagi matn
 */
export function formatCredits(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0 ta maqola';
  return `${n} ta maqola`;
}

/**
 * 2. Sana formatlash
 * @param date Sana string yoki Date obyekti
 * @returns "20 May, 2026" formatidagi o'zbekcha sana
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month}, ${year}`;
}

/**
 * 3. Vaqtni relative formatlash
 * @param date Sana string yoki Date obyekti
 * @returns "5 daqiqa oldin", "2 soat oldin" va hokazo
 */
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
  if (seconds < 60) return Math.floor(seconds) + ' soniya oldin';
  
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + ' yil oldin';
  
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + ' oy oldin';
  
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + ' kun oldin';
  
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + ' soat oldin';
  
  interval = seconds / 60;
  return Math.floor(interval) + ' daqiqa oldin';
}

/**
 * 4. Keyingi nashr sanasini hisoblash
 * @param days Hafta kunlari (ingliz tilida: ['Monday', ...])
 * @param time Vaqt (masalan '09:00')
 * @returns Keyingi nashr vaqti matni
 */
export function calculateNextPublish(days: string[] | null | undefined, time: string | null | undefined): string {
  if (!days || days.length === 0 || !time) return 'Belgilanmagan';
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const uzDays: Record<string, string> = {
    'Sunday': 'Yakshanba',
    'Monday': 'Dushanba',
    'Tuesday': 'Seshanba',
    'Wednesday': 'Chorshanba',
    'Thursday': 'Payshanba',
    'Friday': 'Juma',
    'Saturday': 'Shanba'
  };

  const now = new Date();
  const currentDayIndex = now.getDay();
  
  const [hours, minutes] = time.split(':').map(Number);
  const publishTimeToday = new Date(now);
  publishTimeToday.setHours(hours, minutes, 0, 0);

  const isTodayPublishDay = days.includes(dayNames[currentDayIndex]);
  const isTimePassed = now > publishTimeToday;

  if (isTodayPublishDay && !isTimePassed) {
    return `Bugun, ${time}`;
  }

  // Keyingi kunni qidirish
  let nextDayIndex = -1;
  for (let i = 1; i <= 7; i++) {
    const checkIndex = (currentDayIndex + i) % 7;
    if (days.includes(dayNames[checkIndex])) {
      nextDayIndex = checkIndex;
      break;
    }
  }

  if (nextDayIndex === -1) return 'Belgilanmagan';

  const nextDayName = dayNames[nextDayIndex];
  return `Keyingi nashr: ${uzDays[nextDayName] || nextDayName}, ${time}`;
}

/**
 * 5. Qiyinchilik darajasi
 * @param score Baho (0-100)
 * @returns { label, color } mos rang va matn qaytaradi
 */
export function getDifficultyLabel(score: number | null | undefined): { label: string; color: string } {
  if (score == null || isNaN(score)) return { label: "Noma'lum", color: "gray" };
  if (score <= 35) return { label: "Oson", color: "green" };
  if (score <= 65) return { label: "O'rtacha", color: "yellow" };
  return { label: "Qiyin", color: "red" };
}

/**
 * 6. So'z sanash
 * @param html HTML yoki oddiy matn
 * @returns So'zlar soni
 */
export function countWords(html: string | null | undefined): number {
  if (!html) return 0;
  // HTML teglarni tozalash (masalan <p>, <strong> va h.k.)
  const text = html.replace(/<[^>]*>?/gm, ' ');
  // Bo'sh joylar orqali bo'lib sanash
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

/**
 * 7. Excerpt yaratish
 * @param html HTML matn
 * @param maxLength Maksimal uzunlik (default: 150)
 * @returns Kesilgan va tozalangan toza matn
 */
export function createExcerpt(html: string | null | undefined, maxLength: number = 150): string {
  if (!html) return '';
  const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * 8. URL validatsiya
 * @param url Tekshiriladigan URL (http:// yoki https://)
 * @returns URL to'g'ri bo'lsa true, aks holda false
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * 9. WP Application Password formatlash
 * @param password Parol string
 * @returns "XXXX XXXX XXXX XXXX" kabi guruhlangan format
 */
export function formatWpPassword(password: string | null | undefined): string {
  if (!password) return '';
  const clean = password.replace(/\s+/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * 10. Plan nomi
 * @param plan Plan kodi (free, starter, va h.k.)
 * @returns Plan nomi (user-friendly formatda)
 */
export function getPlanLabel(plan: string | null | undefined): string {
  if (!plan) return 'Noma\'lum';
  const plans: Record<string, string> = {
    'free': 'Bepul',
    'starter': 'Starter Autopilot',
    'pro': 'Pro Autopilot',
    'agency': 'Agency Network'
  };
  return plans[plan.toLowerCase()] || plan;
}
