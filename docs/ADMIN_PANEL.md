# Admin Panel V1

JetBlog uchun admin panel — role-based access, audit log, impersonation.

## 1. Deploy — Migration

Prod Supabase → SQL Editor'da ishga tushiring:

```sql
-- Full file: supabase/migrations/20260719000000_admin_panel_v1.sql
```

Migration:
- `profiles`: `role`, `is_suspended`, `suspended_*`, `deactivated_at`, `deleted_at` ustunlari
- `admin_audit_log` jadval + RLS (faqat admin/super_admin ko'radi)
- `admin_impersonation_sessions` jadval
- **Otabek (`otabekmardanov3@gmail.com`) avtomatik `super_admin` bo'ladi**

## 2. Verify

```sql
SELECT p.id, u.email, p.role
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role != 'user';
```

Kutilayotgan qator: `otabekmardanov3@gmail.com | super_admin`.

## 3. Rollar

| Role | Ruxsatlar |
|---|---|
| `user` | Oddiy foydalanuvchi |
| `admin` | Users list, credits, cancel sub, suspend, deactivate, impersonate |
| `super_admin` | Yuqoridagi + Team management + Delete permanently |

Super_admin qo'shish faqat SQL orqali:
```sql
UPDATE profiles SET role = 'super_admin' WHERE id = '<uuid>';
```

## 4. Actions — nima qiladi

| Action | Kim | Nima qiladi |
|---|---|---|
| **+ Credits** | admin+ | `profiles.credits_remaining += amount`. Reason majburiy. |
| **Cancel Sub** | admin+ | PayPal API'ga cancel yuboradi + status='cancelled'. |
| **Suspend** | admin+ | `is_suspended=true`. User `/dashboard`ga kirsa `/suspended` sahifa. |
| **Unsuspend** | admin+ | `is_suspended=false`. |
| **View as** | admin+ | Impersonation cookie o'rnatadi. `/dashboard`ga redirect. Super_admin'ni impersonate qilib bo'lmaydi. |
| **Deactivate** | admin+ | Email confirmation. Subscription cancel + is_suspended=true + deactivated_at. |
| **Delete permanently** | super_admin | Email + "DELETE" text confirmation. `auth.users`dan o'chiradi (CASCADE). |

Har action `admin_audit_log`ga yoziladi + Vercel log'ga `[admin] <action>` prefiksda chiqadi.

## 5. Impersonation — xavfsizlik

**Cookie**: `jetblog_impersonation` (httpOnly, secure, 30 min TTL).

**Session table**: `admin_impersonation_sessions` — expiry + admin_id validation.

**Read-only** hozircha faqat visual (banner "Read-only"). Real destructive action'lar (subscribe, cancel, delete) impersonation session'да blok qilinmaydi — client tomonda tugmalar disabled qilish keyingi bosqichda qo'shiladi. **Xavfsizlik**: impersonation session'da admin PayPal Subscribe tugmasini bossa, subscription admin'ning o'z PayPal accountiga bog'lanmaydi (PayPal flow foydalanuvchi PayPal login qilishini talab qiladi).

**Qamrov**: impersonation faqat `/dashboard/*` da amal qiladi. `/admin/*`, `/api/paypal/*`, `/api/admin/*` — har doim real admin user ishlatiladi.

## 6. Middleware guard

`/admin/*`:
- Login yo'q → `/auth/login`
- `role ∉ ('admin','super_admin')` → 404 rewrite (admin route mavjudligini yashirish)

`/dashboard/*`:
- `is_suspended=true` → `/suspended` sahifa

## 7. Audit log

Har admin action:
- `admin_audit_log`ga row
- `console.log('[admin]', action, {...})` — Vercel Logs'da qidirish uchun
- Sensitive ma'lumot (parol, secret) LOG'ga chiqmaydi

Ko'rish: `/admin/team` sahifasi (super_admin) → last 50 log.

## 8. Rate limiting

Hozirgi V1 da admin action'lar rate-limit qilinmagan. Kelasi bosqichda per-admin `10/min` qo'shiladi (mavjud `withRateLimit` helperi orqali).

## 9. Testlash

Local (sandbox):
1. Yangi user yarat
2. `UPDATE profiles SET role = 'admin' WHERE id = '<uuid>'`
3. `/admin` ga kir — sidebar Users + (agar super_admin bo'lsa) Team ko'rinishi kerak
4. Users list → filter/search sinash
5. Modal action'lar: +Credits, Suspend, View as (impersonation banner ko'rinishi kerak)

## 10. Kelasi bosqich

- Rate limit `withRateLimit(rateLimiters.admin)`
- Impersonation'da destructive UI button'lar disabled
- Gemini/OpenAI spend tracking (article_runs.tokens_used)
- CSV export (users, audit log)
- Bulk actions
