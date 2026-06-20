# Production Environment Variables

All variables required to run the app in production on Vercel.  
Values are never stored here — names only.

---

## Domain / App URL

| Variable | What breaks without it |
|---|---|
| `NEXT_PUBLIC_DOMAIN` | Sitemap, og:url, auth redirects all use wrong base URL |
| `NEXT_PUBLIC_APP_URL` | Cron dispatcher cannot build the `/api/cron/site` worker URL → autopilot silent-fails |
| `NEXT_PUBLIC_ENVIRONMENT` | Sentry environment tag missing (non-fatal) |

---

## Supabase

| Variable | What breaks without it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All DB reads/writes fail; entire app non-functional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase calls fail; auth broken |
| `SUPABASE_SERVICE_ROLE_KEY` | All server-side DB operations fail (RLS bypass not possible); cron, admin routes, credit RPCs all broken |

---

## AI (Anthropic / OpenAI)

| Variable | What breaks without it |
|---|---|
| `ANTHROPIC_API_KEY` | Article generation with Claude fails (500 on `/api/generate` and `/api/cron/site`) |
| `OPENAI_API_KEY` | DALL-E 3 cover image generation fails; articles are published without featured image (non-fatal but degrades content) |

---

## QStash (Autopilot Queue)

| Variable | What breaks without it |
|---|---|
| `QSTASH_TOKEN` | Cron dispatcher falls back to direct HTTP (no retries, no DLQ) — dev-only fallback, not production-safe |
| `QSTASH_CURRENT_SIGNING_KEY` | Worker `/api/cron/site` cannot verify QStash signatures → falls back to `CRON_SECRET` auth only |
| `QSTASH_NEXT_SIGNING_KEY` | Same as above; needed for key rotation without downtime |

---

## GSC / Google OAuth

| Variable | What breaks without it |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Search Console OAuth flow fails; no GSC token exchange |
| `GOOGLE_CLIENT_SECRET` | Same — OAuth callback errors out |
| `GOOGLE_REDIRECT_URI` | OAuth redirect mismatch; GSC connect broken (must match Google Console allowed URIs exactly) |

---

## Telegram

| Variable | What breaks without it |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram channel notifications silently fail after publish (non-fatal; article still published) |

---

## Cron / Autopilot

| Variable | What breaks without it |
|---|---|
| `CRON_SECRET` | `/api/cron` dispatcher and `/api/cron/site` worker reject ALL requests (401) — autopilot completely disabled |

---

## Vault / Encryption

| Variable | What breaks without it |
|---|---|
| `SUPABASE_VAULT_KEY` | Server HARD CRASHES at startup — `encryption.ts` throws on init if key is missing or < 32 chars. WordPress site credentials cannot be decrypted → no WP publish possible even if bypassed |

> **Critical:** This must be exactly the same value used when credentials were first encrypted. Rotating it requires re-encrypting all stored passwords.

---

## Rate Limiting (Upstash Redis)

| Variable | What breaks without it |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Rate limiting disabled; Upstash Redis logs warning at startup (non-fatal — routes still work) |
| `UPSTASH_REDIS_REST_TOKEN` | Same as above |

---

## Error Monitoring (Sentry)

| Variable | What breaks without it |
|---|---|
| `SENTRY_DSN` | Server/edge Sentry error reporting disabled (non-fatal) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry error reporting disabled (non-fatal) |
| `SENTRY_ORG` | Sentry source map upload in build fails (build still succeeds) |
| `SENTRY_PROJECT` | Same |
| `SENTRY_AUTH_TOKEN` | Same — source maps not uploaded to Sentry |

---

## Webhook HMAC Signing

| Variable | What breaks without it |
|---|---|
| `JETBLOG_SECRET` | Outgoing webhook HMAC signatures cannot be generated; third-party webhook receivers cannot verify authenticity |

---

## DataForSEO (Keyword Research)

| Variable | What breaks without it |
|---|---|
| `DATAFORSEO_LOGIN` | Keyword fetch API (`/api/keywords/fetch`) returns 500 |
| `DATAFORSEO_PASSWORD` | Same |

---

## Summary: Hard failures vs soft failures

**App won't start / completely broken:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_VAULT_KEY` (throws on module init)
- `CRON_SECRET` (autopilot all 401)

**Feature broken but app loads:**
- `ANTHROPIC_API_KEY` — no article generation
- `OPENAI_API_KEY` — no cover images
- `QSTASH_TOKEN` / signing keys — no reliable autopilot queue
- `GOOGLE_*` — no GSC integration
- `DATAFORSEO_*` — no keyword data
- `NEXT_PUBLIC_APP_URL` — cron dispatcher silent-fails

**Non-fatal (monitoring/notifications only):**
- `TELEGRAM_BOT_TOKEN`, `SENTRY_*`, `UPSTASH_REDIS_*`, `JETBLOG_SECRET`
