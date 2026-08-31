-- Migration: Projects & project fundraising
-- Date: 2026-08-31
-- Purpose: Make church projects first-class fundraising entities and map
--          PayBill account prefixes to projects without breaking existing data.

-- ============================================================================
-- 1. PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
  target_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
  start_date DATE,
  target_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
  account_prefix VARCHAR(32),
  public_visibility BOOLEAN NOT NULL DEFAULT TRUE,
  allow_contributions BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_church_id ON projects(church_id);
CREATE INDEX IF NOT EXISTS idx_projects_church_status ON projects(church_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(church_id, public_visibility, status);

-- A project code is optional, but when present it must be unique per church.
CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_church_code
  ON projects(church_id, code)
  WHERE code IS NOT NULL;

-- ============================================================================
-- 2. PROJECT PAYMENT ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  account_prefix VARCHAR(32) NOT NULL,
  display_name VARCHAR(120),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_accounts_id UNIQUE(id)
);

-- A PayBill account prefix can only resolve to one active project within a church.
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_accounts_church_prefix_active
  ON project_accounts(church_id, account_prefix)
  WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_project_accounts_project ON project_accounts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_accounts_church ON project_accounts(church_id);

-- Keep projects.account_prefix as a convenient display/backward-compatible field;
-- project_accounts is the authoritative payment-routing table.

-- ============================================================================
-- 3. LINK TRANSACTIONS TO PROJECTS
-- ============================================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_project
  ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_church_project_date
  ON transactions(church_id, project_id, date DESC);

-- ============================================================================
-- 4. CHURCH PAYMENT ACCOUNT CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS church_payment_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'MPESA',
  account_type VARCHAR(30) NOT NULL DEFAULT 'PAYBILL',
  paybill_number VARCHAR(32) NOT NULL,
  display_name VARCHAR(120),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_church_payment_accounts_church
  ON church_payment_accounts(church_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_church_payment_accounts_active
  ON church_payment_accounts(church_id, provider, account_type, paybill_number)
  WHERE active = TRUE;

-- ============================================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_projects_updated_at();

DROP TRIGGER IF EXISTS trg_project_accounts_updated_at ON project_accounts;
CREATE TRIGGER trg_project_accounts_updated_at
  BEFORE UPDATE ON project_accounts
  FOR EACH ROW EXECUTE FUNCTION set_projects_updated_at();

DROP TRIGGER IF EXISTS trg_church_payment_accounts_updated_at ON church_payment_accounts;
CREATE TRIGGER trg_church_payment_accounts_updated_at
  BEFORE UPDATE ON church_payment_accounts
  FOR EACH ROW EXECUTE FUNCTION set_projects_updated_at();

-- ============================================================================
-- 6. RLS
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_payment_accounts ENABLE ROW LEVEL SECURITY;

-- Policies deliberately use the existing tenant helper. These policies should
-- be reviewed alongside the complete production RLS policy set before rollout.
DROP POLICY IF EXISTS projects_tenant_select ON projects;
CREATE POLICY projects_tenant_select ON projects
  FOR SELECT USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS projects_tenant_insert ON projects;
CREATE POLICY projects_tenant_insert ON projects
  FOR INSERT WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS projects_tenant_update ON projects;
CREATE POLICY projects_tenant_update ON projects
  FOR UPDATE USING (church_id::text = app_church_id())
  WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS projects_tenant_delete ON projects;
CREATE POLICY projects_tenant_delete ON projects
  FOR DELETE USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS project_accounts_tenant_select ON project_accounts;
CREATE POLICY project_accounts_tenant_select ON project_accounts
  FOR SELECT USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS project_accounts_tenant_insert ON project_accounts;
CREATE POLICY project_accounts_tenant_insert ON project_accounts
  FOR INSERT WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS project_accounts_tenant_update ON project_accounts;
CREATE POLICY project_accounts_tenant_update ON project_accounts
  FOR UPDATE USING (church_id::text = app_church_id())
  WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS project_accounts_tenant_delete ON project_accounts;
CREATE POLICY project_accounts_tenant_delete ON project_accounts
  FOR DELETE USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS church_payment_accounts_tenant_select ON church_payment_accounts;
CREATE POLICY church_payment_accounts_tenant_select ON church_payment_accounts
  FOR SELECT USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS church_payment_accounts_tenant_insert ON church_payment_accounts;
CREATE POLICY church_payment_accounts_tenant_insert ON church_payment_accounts
  FOR INSERT WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS church_payment_accounts_tenant_update ON church_payment_accounts;
CREATE POLICY church_payment_accounts_tenant_update ON church_payment_accounts
  FOR UPDATE USING (church_id::text = app_church_id())
  WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS church_payment_accounts_tenant_delete ON church_payment_accounts;
CREATE POLICY church_payment_accounts_tenant_delete ON church_payment_accounts
  FOR DELETE USING (church_id::text = app_church_id());

-- ============================================================================
-- 7. PUBLIC PROJECT READ MODEL
-- ============================================================================

-- Public pages must never expose private church/member information. This view
-- intentionally exposes only project presentation fields. Public access policy
-- should be wired to the application's chosen public-read strategy.
CREATE OR REPLACE VIEW public_projects AS
SELECT
  id,
  church_id,
  name,
  code,
  description,
  category,
  target_amount,
  start_date,
  target_date,
  status,
  public_visibility,
  allow_contributions,
  image_url
FROM projects
WHERE public_visibility = TRUE
  AND status = 'ACTIVE';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
