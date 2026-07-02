-- Migration: Schema cleanup — drop tenant_id, members.groups deferred, add computed age

-- Drop legacy tenant_id columns (migration 00001 added these before church_id existed in 00002)
DO $$ BEGIN
  ALTER TABLE members DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE transactions DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE church_events DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE event_attendance DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE groups DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE group_members DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE communications DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE activities DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE budgets DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE recurring_expenses DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE sermons DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE notifications DROP COLUMN IF EXISTS tenant_id;
  ALTER TABLE audit_logs DROP COLUMN IF EXISTS tenant_id;
END $$;

-- Replace stored age with computed column from birthday
ALTER TABLE members DROP COLUMN IF EXISTS age;
ALTER TABLE members ADD COLUMN IF NOT EXISTS birthday text;

CREATE OR REPLACE FUNCTION member_age(birthday text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, birthday::date))::integer
  WHERE birthday ~ '^\d{4}-\d{2}-\d{2}$'
$$;
