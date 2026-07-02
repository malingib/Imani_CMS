-- Migration: Schema optimizations — updated_at trigger, indices, FK constraints

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER church_events_updated_at BEFORE UPDATE ON church_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER group_members_updated_at BEFORE UPDATE ON group_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER communications_updated_at BEFORE UPDATE ON communications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER sermons_updated_at BEFORE UPDATE ON sermons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER churches_updated_at BEFORE UPDATE ON churches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN others THEN NULL;
END $$;

-- Indices for tenant isolation queries
CREATE INDEX IF NOT EXISTS idx_members_church_id ON members(church_id);
CREATE INDEX IF NOT EXISTS idx_transactions_church_id ON transactions(church_id);
CREATE INDEX IF NOT EXISTS idx_church_events_church_id ON church_events(church_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_church_id ON event_attendance(church_id);
CREATE INDEX IF NOT EXISTS idx_groups_church_id ON groups(church_id);
CREATE INDEX IF NOT EXISTS idx_group_members_church_id ON group_members(church_id);
CREATE INDEX IF NOT EXISTS idx_communications_church_id ON communications(church_id);
CREATE INDEX IF NOT EXISTS idx_activities_church_id ON activities(church_id);
CREATE INDEX IF NOT EXISTS idx_budgets_church_id ON budgets(church_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_church_id ON recurring_expenses(church_id);
CREATE INDEX IF NOT EXISTS idx_sermons_church_id ON sermons(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_church_id ON audit_logs(church_id);

-- Indices for common lookup fields
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_church_events_date ON church_events(date);
CREATE INDEX IF NOT EXISTS idx_churches_slug ON churches(slug);
CREATE INDEX IF NOT EXISTS idx_churches_status ON churches(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_church_id ON subscriptions(church_id);
CREATE INDEX IF NOT EXISTS idx_invoices_church_id ON invoices(church_id);
CREATE INDEX IF NOT EXISTS idx_invitations_church_id ON invitations(church_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_member_id ON event_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_member_id ON group_members(member_id);

-- Foreign key constraints for church_id (migration 00002 added the columns without FK)
DO $$ BEGIN
  ALTER TABLE members ADD CONSTRAINT fk_members_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE transactions ADD CONSTRAINT fk_transactions_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE church_events ADD CONSTRAINT fk_church_events_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE event_attendance ADD CONSTRAINT fk_event_attendance_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE groups ADD CONSTRAINT fk_groups_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE group_members ADD CONSTRAINT fk_group_members_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE communications ADD CONSTRAINT fk_communications_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE activities ADD CONSTRAINT fk_activities_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE budgets ADD CONSTRAINT fk_budgets_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE recurring_expenses ADD CONSTRAINT fk_recurring_expenses_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE sermons ADD CONSTRAINT fk_sermons_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE notifications ADD CONSTRAINT fk_notifications_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_church FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Foreign key for audit_logs.user_id to auth.users
DO $$ BEGIN
  ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
