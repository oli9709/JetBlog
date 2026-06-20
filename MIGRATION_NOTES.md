# Migration Notes

## Next.js 16 — "middleware" → "proxy" rename (DEFERRED)

**Warning:** `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**File:** `src/middleware.ts`

**Status:** NOT migrated — deferred pending confirmation.

**Why deferred:** The file contains Supabase auth session checking and redirects unauthenticated users to `/auth/login`. Renaming to `src/proxy.ts` is the documented Next.js 16 migration but requires verifying that:
1. The `middleware` named export becomes `proxy` (or stays `middleware`).
2. The `config.matcher` export works identically.
3. Auth redirects continue to work in the proxy context.

**To migrate:** Once confirmed safe, rename `src/middleware.ts` → `src/proxy.ts` and verify auth still redirects unauthenticated `/dashboard/:path*` requests.

---

## @sentry/nextjs — disableLogger (DONE)

**Warning:** `disableLogger is deprecated. Use webpack.treeshake.removeDebugLogging instead.`

**File:** `next.config.js`

**Change:** Replaced `disableLogger: true` with `webpack: { treeshake: { removeDebugLogging: true } }` in the `withSentryConfig` options.

**Note:** Neither option is supported with Turbopack (build uses Turbopack), so this is a forward-compatibility change only.
