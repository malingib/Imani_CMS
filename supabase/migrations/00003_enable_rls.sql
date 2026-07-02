-- Migration: Enable RLS on all domain tables and create tenant-isolation policies
-- Apply: supabase db push (requires Docker) or paste into Supabase SQL editor

-- Enable RLS on all tenant-scoped domain tables
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

-- Enable RLS on platform tables
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to allow clean replay
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
DROP POLICY IF EXISTS churches_super_admin_all ON churches;
DROP POLICY IF EXISTS churches_tenant_read ON churches;
DROP POLICY IF EXISTS subscriptions_tenant_access ON subscriptions;
DROP POLICY IF EXISTS invoices_tenant_access ON invoices;
DROP POLICY IF EXISTS invitations_tenant_access ON invitations;
DROP POLICY IF EXISTS platform_settings_super_admin ON platform_settings;

-- RLS: SUPER_ADMIN can manage all rows; church users can only access their church's data
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

-- Platform table policies
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
