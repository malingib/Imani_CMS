-- Schema/runtime reconciliation fixes
-- 1. Add user_id to notifications (persistence layer reads/writes it)
DO $$ BEGIN
  ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Add created_at + updated_at to event_attendance (app-data orders by created_at)
DO $$ BEGIN
  ALTER TABLE event_attendance ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE event_attendance ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Cast audit_logs.user_id from text to uuid before FK can work
-- Drop the FK first if it exists (from 00005_schema_optimizations)
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_user;
-- Cast column type (only possible if existing values are valid UUIDs or null)
ALTER TABLE audit_logs ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
-- Re-add the FK
DO $$ BEGIN
  ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
