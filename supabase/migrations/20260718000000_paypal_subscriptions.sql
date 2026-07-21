-- PayPal Subscriptions integratsiya poydevori
-- Bitta user bir vaqtda faqat bitta faol subscription

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

-- Webhook eventlarini log qilish (audit + idempotency)
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

-- RLS: paypal_webhook_events — faqat service role o'qishi/yozishi mumkin
ALTER TABLE paypal_webhook_events ENABLE ROW LEVEL SECURITY;
-- Default deny — hech qanday policy user'ga ochilmaydi
