-- Add default_language to sites: article generation + autopilot language.
-- 'ru' is kept in the CHECK so re-enabling Russian later is a routing-only change.
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS default_language text NOT NULL DEFAULT 'uz'
    CHECK (default_language IN ('uz','en','ru'));
