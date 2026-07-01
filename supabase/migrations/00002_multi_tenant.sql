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

-- RLS: church staff see only their church
CREATE POLICY tenant_isolation_members ON members FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_transactions ON transactions FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_events ON church_events FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_event_attendance ON event_attendance FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_groups ON groups FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_group_members ON group_members FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_communications ON communications FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_activities ON activities FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_budgets ON budgets FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_recurring ON recurring_expenses FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_sermons ON sermons FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_notifications ON notifications FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
CREATE POLICY tenant_isolation_audit_logs ON audit_logs FOR ALL
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);

-- SUPER_ADMIN can read all churches
CREATE POLICY super_admin_churches ON churches FOR ALL
  USING ((auth.jwt() ->> 'role') = 'SUPER_ADMIN');
