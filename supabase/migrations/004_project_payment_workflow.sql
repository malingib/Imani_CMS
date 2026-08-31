-- Migration: Project payment workflow
-- Purpose: keep project creation + PayBill account mapping atomic and prepare
--          idempotent M-Pesa reconciliation.

-- ---------------------------------------------------------------------------
-- 1. ATOMIC PROJECT + ACCOUNT CREATION
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_project_with_account(
  p_church_id UUID,
  p_created_by UUID,
  p_name VARCHAR(200),
  p_code VARCHAR(50),
  p_description TEXT,
  p_category VARCHAR(50),
  p_target_amount NUMERIC(14,2),
  p_start_date DATE,
  p_target_date DATE,
  p_status VARCHAR(20),
  p_account_prefix VARCHAR(32),
  p_public_visibility BOOLEAN,
  p_allow_contributions BOOLEAN
)
RETURNS projects
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_project projects;
BEGIN
  IF p_church_id::text <> app_church_id() THEN
    RAISE EXCEPTION 'Tenant mismatch';
  END IF;

  IF p_account_prefix IS NULL OR btrim(p_account_prefix) = '' THEN
    RAISE EXCEPTION 'A project payment account prefix is required';
  END IF;

  INSERT INTO projects (
    church_id, name, code, description, category, target_amount,
    start_date, target_date, status, account_prefix,
    public_visibility, allow_contributions, created_by
  ) VALUES (
    p_church_id, btrim(p_name), NULLIF(btrim(p_code), ''), p_description,
    p_category, p_target_amount, p_start_date, p_target_date, p_status,
    upper(btrim(p_account_prefix)), p_public_visibility, p_allow_contributions,
    p_created_by
  ) RETURNING * INTO v_project;

  INSERT INTO project_accounts (
    church_id, project_id, account_prefix, display_name
  ) VALUES (
    p_church_id, v_project.id, upper(btrim(p_account_prefix)), v_project.name
  );

  RETURN v_project;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Project code or PayBill account prefix is already in use for this church';
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. IDEMPOTENT PAYMENT RECEIPTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mpesa_payment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  paybill_number VARCHAR(32),
  account_reference VARCHAR(64),
  mpesa_receipt VARCHAR(64) NOT NULL,
  transaction_date TIMESTAMPTZ,
  phone_number VARCHAR(32),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
    CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'UNMATCHED', 'FAILED')),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mpesa_payment_events_receipt
  ON mpesa_payment_events(mpesa_receipt);
CREATE INDEX IF NOT EXISTS idx_mpesa_payment_events_church
  ON mpesa_payment_events(church_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mpesa_payment_events_account
  ON mpesa_payment_events(church_id, account_reference);

ALTER TABLE mpesa_payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mpesa_payment_events_tenant_select ON mpesa_payment_events;
CREATE POLICY mpesa_payment_events_tenant_select ON mpesa_payment_events
  FOR SELECT USING (church_id::text = app_church_id());

-- Inserts/updates should normally happen from a trusted server-side webhook
-- using the service role. No client INSERT policy is intentionally provided.

-- ---------------------------------------------------------------------------
-- 3. HELPER FOR NORMALIZED PROJECT ACCOUNT LOOKUP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION resolve_project_account(
  p_church_id UUID,
  p_account_prefix VARCHAR(32)
)
RETURNS TABLE (
  project_id UUID,
  account_prefix VARCHAR(32),
  project_name VARCHAR(200)
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT pa.project_id, pa.account_prefix, p.name
  FROM project_accounts pa
  JOIN projects p ON p.id = pa.project_id
  WHERE pa.church_id = p_church_id
    AND pa.account_prefix = upper(btrim(p_account_prefix))
    AND pa.active = TRUE
    AND p.status = 'ACTIVE'
    AND p.allow_contributions = TRUE;
$$;
