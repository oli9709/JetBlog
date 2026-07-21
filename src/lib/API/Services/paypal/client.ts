import 'server-only';

/**
 * PayPal Subscriptions server-side yagona nuqta.
 *
 * Mode'ga qarab (sandbox / live) credentials, base URL, webhook_id va
 * plan_id larni env'dan oladi. Access token OAuth2 client_credentials
 * orqali olinadi va xotirada ~8 soat cache qilinadi (PayPal 9 soat beradi).
 *
 * Env yo'q bo'lsa runtime crash bo'lmasin — chaqiruvchi funksiyalar
 * xato holida structured error qaytaradi, log'ga yozadi.
 *
 * Log qoidasi: sensitive ma'lumot (secret, to'liq webhook body) chiqmasin.
 * Faqat mode, endpoint, event_type, resource_id, status.
 */

export type PaypalMode = 'sandbox' | 'live';
export type PaypalPlan = 'starter' | 'pro';

export interface PaypalCredentials {
  clientId: string;
  secret: string;
  webhookId: string;
}

const SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';
const LIVE_BASE = 'https://api-m.paypal.com';

/** Rejimni env dan o'qish. Noto'g'ri qiymat → sandbox fallback. */
export function getPaypalMode(): PaypalMode {
  const raw = (process.env.PAYPAL_MODE ?? 'sandbox').toLowerCase();
  return raw === 'live' ? 'live' : 'sandbox';
}

export function getPaypalBaseUrl(): string {
  return getPaypalMode() === 'live' ? LIVE_BASE : SANDBOX_BASE;
}

/**
 * Credentials — env yo'q bo'lsa bo'sh string qaytaradi.
 * Callers `if (!clientId || !secret)` bilan tekshirishi kerak.
 */
export function getPaypalCredentials(): PaypalCredentials {
  const mode = getPaypalMode();
  if (mode === 'live') {
    return {
      clientId: process.env.PAYPAL_CLIENT_ID_LIVE ?? '',
      secret: process.env.PAYPAL_SECRET_LIVE ?? '',
      webhookId: process.env.PAYPAL_WEBHOOK_ID_LIVE ?? '',
    };
  }
  return {
    clientId: process.env.PAYPAL_CLIENT_ID_SANDBOX ?? '',
    secret: process.env.PAYPAL_SECRET_SANDBOX ?? '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID_SANDBOX ?? '',
  };
}

export function getPaypalPlanId(plan: PaypalPlan): string {
  const mode = getPaypalMode();
  const key =
    mode === 'live'
      ? plan === 'pro' ? 'PAYPAL_PLAN_PRO_LIVE' : 'PAYPAL_PLAN_STARTER_LIVE'
      : plan === 'pro' ? 'PAYPAL_PLAN_PRO_SANDBOX' : 'PAYPAL_PLAN_STARTER_SANDBOX';
  return process.env[key] ?? '';
}

/** Plan → oylik kredit miqdori */
export function getPlanCredits(plan: PaypalPlan): number {
  return plan === 'pro' ? 80 : 30;
}

// ── Access token cache ───────────────────────────────────────────────────────
interface CachedToken {
  token: string;
  expiresAt: number; // ms epoch
}
let cachedToken: CachedToken | null = null;
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // ~8 hours (PayPal beradi 9h)

/**
 * OAuth2 client_credentials orqali access token oladi.
 * Xotirada cache qilinadi (~8 soat).
 * Env yo'q yoki xato bo'lsa null qaytaradi.
 */
export async function getPaypalAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const { clientId, secret } = getPaypalCredentials();
  if (!clientId || !secret) {
    console.warn('[paypal] credentials missing — check PAYPAL_MODE and matching client_id/secret env');
    return null;
  }

  const basic = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const res = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(10_000),
  }).catch((err) => {
    console.error('[paypal] token fetch network error', { message: err?.message });
    return null;
  });

  if (!res || !res.ok) {
    const body = res ? await res.text().catch(() => '') : '';
    console.error('[paypal] token exchange failed', {
      status: res?.status,
      body: body.slice(0, 200),
    });
    return null;
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    console.error('[paypal] token response missing access_token');
    return null;
  }

  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + Math.min(TOKEN_TTL_MS, (json.expires_in ?? 32_400) * 1000 - 60_000),
  };
  return cachedToken.token;
}

export interface PaypalError {
  status: number;
  debugId?: string;
  name?: string;
  details?: unknown;
  message?: string;
}

/**
 * Fetch wrapper — Authorization header'ni avtomatik qo'shadi.
 * Xato bo'lsa structured PaypalError qaytaradi (throw qilmaydi) va debug_id ni log qiladi.
 */
export type PaypalFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PaypalError };

export async function paypalFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<PaypalFetchResult<T>> {
  const token = await getPaypalAccessToken();
  if (!token) {
    return { ok: false, error: { status: 0, message: 'PayPal access token unavailable' } };
  }

  const url = `${getPaypalBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(15_000),
  }).catch((err) => {
    console.error('[paypal] fetch network error', { path, message: err?.message });
    return null;
  });

  if (!res) {
    return { ok: false, error: { status: 0, message: 'network' } };
  }

  // Ba'zi endpointlar (cancel) 204 No Content qaytaradi
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // no-op — non-json response
    }
  }

  if (!res.ok) {
    const errBody = json as { name?: string; message?: string; debug_id?: string; details?: unknown } | null;
    const errInfo: PaypalError = {
      status: res.status,
      debugId: errBody?.debug_id,
      name: errBody?.name,
      message: errBody?.message,
      details: errBody?.details,
    };
    console.error('[paypal] api error', {
      path,
      status: errInfo.status,
      name: errInfo.name,
      debug_id: errInfo.debugId,
      message: errInfo.message,
    });
    return { ok: false, error: errInfo };
  }

  return { ok: true, data: (json as T) ?? ({} as T) };
}

/** Test yordamchisi — cache'ni tozalash uchun */
export function _clearPaypalTokenCache(): void {
  cachedToken = null;
}
