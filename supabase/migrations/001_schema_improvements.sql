-- Migration: Schema improvements for Imani CMS
-- Date: 2026-07-02
-- Description: Add indexes, soft deletes, updated_at timestamps, and audit trail enhancements

-- ============================================================================
-- 1. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on church_id for all tables (critical for multi-tenant scoping)
CREATE INDEX IF NOT EXISTS idx_members_church_id ON members(church_id);
CREATE INDEX IF NOT EXISTS idx_transactions_church_id ON transactions(church_id);
CREATE INDEX IF NOT EXISTS idx_church_events_church_id ON church_events(church_id);
CREATE INDEX IF NOT EXISTS idx_budgets_church_id ON budgets(church_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_church_id ON recurring_expenses(church_id);
CREATE INDEX IF NOT EXISTS idx_communications_church_id ON communications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_church_id ON notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_church_id ON audit_logs(church_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_members_church_status ON members(church_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_church_date ON transactions(church_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_member_id ON event_attendance(member_id);

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- ============================================================================
-- 2. ADD UPDATED_AT TIMESTAMPS FOR AUDIT TRAIL
-- ============================================================================

-- Add updated_at to members table if not exists
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to transactions table if not exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to church_events table if not exists
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to budgets table if not exists
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- 3. ADD SOFT DELETE SUPPORT
-- ============================================================================

-- Add deleted_at column to members (soft delete)
ALTER TABLE members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at column to transactions (soft delete)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create view for non-deleted members
CREATE OR REPLACE VIEW active_members AS
SELECT * FROM members WHERE deleted_at IS NULL;

-- Create view for non-deleted transactions
CREATE OR REPLACE VIEW active_transactions AS
SELECT * FROM transactions WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. IMPROVE COMMUNICATIONS TABLE
-- ============================================================================

-- Add delivery tracking columns if not exists
ALTER TABLE communications ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'Sent';
ALTER TABLE communications ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;

-- ============================================================================
-- 5. ADD AUDIT METADATA
-- ============================================================================

-- Add metadata column to audit_logs for extended information
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index on timestamp for audit trail queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS) BEST PRACTICES
-- ============================================================================

-- Create helper functions for RLS policies (if using custom auth)
-- Note: These should be called in your RLS policy definitions

CREATE OR REPLACE FUNCTION app_role() RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb->>'role'
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app_church_id() RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb->>'church_id'
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- 7. MEMBER PHOTO STORAGE DOCUMENTATION
-- ============================================================================

-- Note: Member photos should be stored in Vercel Blob or Supabase Storage
-- The photo column contains the signed URL to the stored image
-- Example policy for the members table photo column:
-- - Photos are served via signed URLs from blob storage
-- - Expiration: 7 days
-- - Access: Limited to authenticated users of the same church

COMMENT ON COLUMN members.photo IS 'Signed URL to member photo in blob storage. Expires after 7 days.';

-- ============================================================================
-- 8. CREATE CHANGE LOG TABLE FOR ADVANCED AUDITING
-- ============================================================================

CREATE TABLE IF NOT EXISTS member_change_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  church_id UUID NOT NULL,
  field_name VARCHAR NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_church FOREIGN KEY (church_id) REFERENCES churches(id)
);

CREATE INDEX IF NOT EXISTS idx_member_change_log_member ON member_change_log(member_id);
CREATE INDEX IF NOT EXISTS idx_member_change_log_church ON member_change_log(church_id);

-- ============================================================================
-- 9. PERFORMANCE MAINTENANCE
-- ============================================================================

-- Vacuum statistics are important for large tables
-- Run periodically: VACUUM ANALYZE members, transactions, church_events;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
