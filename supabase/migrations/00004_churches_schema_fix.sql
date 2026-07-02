-- Fix churches schema: add missing columns and update status constraint

ALTER TABLE churches ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'welcome';

ALTER TABLE churches DROP CONSTRAINT IF EXISTS churches_status_check;
ALTER TABLE churches ADD CONSTRAINT churches_status_check
  CHECK (status IN ('active', 'suspended', 'trialing', 'onboarding'));

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'cancelled', 'expired', 'trialing'));
