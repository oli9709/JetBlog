# PayPal Subscriptions — Setup Guide

JetBlog PayPal Subscriptions (oylik avtomatik to'lov) integratsiyasini yoqish uchun qadam-baqadam yo'riqnoma.

---

## 1. Sandbox / Live rejimni tanlash

`PAYPAL_MODE` env o'zgaruvchisi:
- `sandbox` — test uchun (default). Sandbox client_id/secret ishlatiladi.
- `live` — real to'lov. Live client_id/secret ishlatiladi.

Kod bitta joyдa aniqlanadi (`src/lib/API/Services/paypal/client.ts` → `getPaypalMode()`), shu sababли mode'ni almashtirish uchun faqat env'ni o'zgartirish kifoya.

---

## 2. PayPal Developer dashboardда Products + Plans yaratish

1. https://developer.paypal.com/ ga kiring
2. **Apps & Credentials** → yangi REST app yarating (Sandbox va Live alohida)
3. Har app uchun `Client ID` va `Secret` ni env'ga qo'shing:
   - `PAYPAL_CLIENT_ID_SANDBOX` / `PAYPAL_SECRET_SANDBOX`
   - `PAYPAL_CLIENT_ID_LIVE` / `PAYPAL_SECRET_LIVE`

### Products
**Catalog** → **Products** → **Create Product**:
- Name: `JetBlog Subscription`
- Type: `SERVICE`
- Category: `SOFTWARE`

### Plans (har product uchun 2 ta)
**Products** → tanlangan product → **Create Plan**:

**Starter**:
- Name: `JetBlog Starter Monthly`
- Price: `$9.00 USD`
- Billing cycle: Monthly, Regular pricing
- `plan_id` ni nusxa oling → env: `PAYPAL_PLAN_STARTER_SANDBOX` (yoki LIVE)

**Pro**:
- Name: `JetBlog Pro Monthly`
- Price: `$29.00 USD`
- Billing cycle: Monthly, Regular pricing
- `plan_id` ni nusxa oling → env: `PAYPAL_PLAN_PRO_SANDBOX` (yoki LIVE)

---

## 3. Webhook yaratish

PayPal Developer dashboard → app → **Webhooks** → **Add Webhook**:

**Endpoint URL**:
- Sandbox: `https://www.jetblog.app/api/paypal/webhook` (yoki test staging)
- Live: `https://www.jetblog.app/api/paypal/webhook`

**Event types** (majburiy, hammasini yoqing):
- `BILLING.SUBSCRIPTION.ACTIVATED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- `BILLING.SUBSCRIPTION.EXPIRED`
- `PAYMENT.SALE.COMPLETED`
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

Webhook yaratilgach `Webhook ID` ni nusxa oling → env:
- `PAYPAL_WEBHOOK_ID_SANDBOX`
- `PAYPAL_WEBHOOK_ID_LIVE`

---

## 4. Env o'zgaruvchilari

Vercel Dashboard → Project → Settings → Environment Variables:

```
PAYPAL_MODE=sandbox              # keyin 'live' ga o'tkaziladi
PAYPAL_CLIENT_ID_SANDBOX=...
PAYPAL_SECRET_SANDBOX=...
PAYPAL_CLIENT_ID_LIVE=...
PAYPAL_SECRET_LIVE=...
PAYPAL_WEBHOOK_ID_SANDBOX=...
PAYPAL_WEBHOOK_ID_LIVE=...
PAYPAL_PLAN_STARTER_SANDBOX=P-...
PAYPAL_PLAN_PRO_SANDBOX=P-...
PAYPAL_PLAN_STARTER_LIVE=P-...
PAYPAL_PLAN_PRO_LIVE=P-...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=... # Front uchun (Sandbox yoki Live client id — mode'ga mos)
```

**Muhim**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — bu clientside'da render qilinadigan yagona qiymat. Mode'ni almashtirganingizda uni ham Sandbox yoki Live client id ga o'zgartiring.

---

## 5. Supabase migration

`supabase/migrations/20260718000000_paypal_subscriptions.sql` fayli hozir repo'да. Prod'ga qo'llash uchun:

**Supabase Dashboard → SQL Editor**да:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS paypal_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text
    CHECK (subscription_status IN ('active','suspended','cancelled','expired','none'))
    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_plan text
    CHECK (subscription_plan IN ('starter','pro','none')) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_next_billing timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_paypal_subscription_id
  ON profiles(paypal_subscription_id) WHERE paypal_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  resource_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_event_type
  ON paypal_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_user_id
  ON paypal_webhook_events(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE paypal_webhook_events ENABLE ROW LEVEL SECURITY;
```

---

## 6. Sandbox test flow

1. `PAYPAL_MODE=sandbox` va Sandbox env'lar to'ldirilgan bo'lsin
2. Sandbox test account'idan buyer yarating (PayPal Developer → **Sandbox** → **Accounts**)
3. `/dashboard/settings/billing` sahifasiga kiring
4. Starter yoki Pro tugmasini bosing → PayPal popup ochiladi
5. Test buyer credentials bilan approve qiling
6. `POST /api/paypal/subscription/activate` avtomatik chaqiriladi
7. Vercel logда:
   ```
   [paypal] subscription activated { userId, plan, subscriptionId, creditsAdded: 30 }
   [paypal/webhook] processed { eventType: 'BILLING.SUBSCRIPTION.ACTIVATED', ... }
   ```
8. `profiles.subscription_status = 'active'` va `credits_remaining += 30`

---

## 7. Live launch

1. `PAYPAL_MODE=live`
2. `NEXT_PUBLIC_PAYPAL_CLIENT_ID` ni Live client_id ga o'zgartiring
3. Vercel re-deploy
4. Real to'lov o'tkazing va webhook log'да `BILLING.SUBSCRIPTION.ACTIVATED` ni tekshiring

---

## 8. Debug

Barcha PayPal log'lар `[paypal]` yoki `[paypal/webhook]` prefiksi bilan Vercel Logs'да.

**Muhim**: hech qanday log'да `secret`, `access_token`, yoki to'liq webhook body chiqmaydi. Faqat `event_type`, `resource_id`, `user_id`, `status`, `debug_id`.

Xato holida `debug_id` ni PayPal Developer support'ga bering — ular request'ni topib beradi.
