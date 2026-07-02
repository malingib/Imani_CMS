-- Multi-tenant: churches + church_id on all tables

CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    ''
  )
$$;

CREATE OR REPLACE FUNCTION app_church_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(auth.jwt() -> 'app_metadata' ->> 'church_id', '')::uuid
$$;

-- Default church
INSERT INTO churches (id, name, slug, tier, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Church', 'demo-church', 'pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- Default pro subscription
INSERT INTO subscriptions (church_id, tier, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'pro', 'active')
ON CONFLICT DO NOTHING;

-- Add church_id columns
DO $$ BEGIN
  ALTER TABLE members ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE church_events ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE event_attendance ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE groups ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE group_members ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE communications ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE activities ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE budgets ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE recurring_expenses ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE sermons ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE notifications ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE audit_logs ADD COLUMN church_id UUID; EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Assign default church to existing rows
UPDATE members SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE transactions SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE church_events SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE event_attendance SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE groups SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE group_members SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE communications SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE activities SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE budgets SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE recurring_expenses SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE sermons SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE notifications SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE audit_logs SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;

-- Make church_id NOT NULL
ALTER TABLE members ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE church_events ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE event_attendance ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE groups ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE group_members ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE communications ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE activities ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE recurring_expenses ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE sermons ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN church_id SET NOT NULL;

-- Enable RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies so this migration can be replayed safely on a remote DB.
DROP POLICY IF EXISTS tenant_isolation_members ON members;
DROP POLICY IF EXISTS tenant_isolation_transactions ON transactions;
DROP POLICY IF EXISTS tenant_isolation_events ON church_events;
DROP POLICY IF EXISTS tenant_isolation_event_attendance ON event_attendance;
DROP POLICY IF EXISTS tenant_isolation_groups ON groups;
DROP POLICY IF EXISTS tenant_isolation_group_members ON group_members;
DROP POLICY IF EXISTS tenant_isolation_communications ON communications;
DROP POLICY IF EXISTS tenant_isolation_activities ON activities;
DROP POLICY IF EXISTS tenant_isolation_budgets ON budgets;
DROP POLICY IF EXISTS tenant_isolation_recurring ON recurring_expenses;
DROP POLICY IF EXISTS tenant_isolation_sermons ON sermons;
DROP POLICY IF EXISTS tenant_isolation_notifications ON notifications;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
DROP POLICY IF EXISTS super_admin_churches ON churches;
DROP POLICY IF EXISTS churches_super_admin_all ON churches;
DROP POLICY IF EXISTS churches_tenant_read ON churches;
DROP POLICY IF EXISTS subscriptions_tenant_access ON subscriptions;
DROP POLICY IF EXISTS invoices_tenant_access ON invoices;
DROP POLICY IF EXISTS invitations_tenant_access ON invitations;
DROP POLICY IF EXISTS super_admin_platform_settings ON platform_settings;
DROP POLICY IF EXISTS platform_settings_super_admin ON platform_settings;

-- RLS: SUPER_ADMIN can manage platform data; church users can only access their church.
CREATE POLICY tenant_isolation_members ON members FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_transactions ON transactions FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_events ON church_events FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_event_attendance ON event_attendance FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_groups ON groups FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_group_members ON group_members FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_communications ON communications FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_activities ON activities FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_budgets ON budgets FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_recurring ON recurring_expenses FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_sermons ON sermons FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_notifications ON notifications FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY tenant_isolation_audit_logs ON audit_logs FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());

CREATE POLICY churches_super_admin_all ON churches FOR ALL
  USING (app_role() = 'SUPER_ADMIN')
  WITH CHECK (app_role() = 'SUPER_ADMIN');
CREATE POLICY churches_tenant_read ON churches FOR SELECT
  USING (id = app_church_id());

CREATE POLICY subscriptions_tenant_access ON subscriptions FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY invoices_tenant_access ON invoices FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());
CREATE POLICY invitations_tenant_access ON invitations FOR ALL
  USING (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id())
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR church_id = app_church_id());

CREATE POLICY platform_settings_super_admin ON platform_settings FOR ALL
  USING (app_role() = 'SUPER_ADMIN')
  WITH CHECK (app_role() = 'SUPER_ADMIN');
