-- Idempotent M-Pesa callback ledger for project contributions.
CREATE TABLE IF NOT EXISTS mpesa_payment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  project_account_id UUID REFERENCES project_accounts(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  mpesa_receipt VARCHAR(64) NOT NULL,
  checkout_request_id VARCHAR(128),
  merchant_request_id VARCHAR(128),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  phone_number VARCHAR(32),
  account_reference VARCHAR(32) NOT NULL,
  result_code INTEGER NOT NULL DEFAULT 0,
  result_description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED', 'PROCESSED', 'FAILED')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mpesa_payment_events_receipt
  ON mpesa_payment_events(mpesa_receipt);
CREATE INDEX IF NOT EXISTS idx_mpesa_payment_events_church
  ON mpesa_payment_events(church_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mpesa_payment_events_project
  ON mpesa_payment_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mpesa_payment_events_checkout
  ON mpesa_payment_events(checkout_request_id);

ALTER TABLE mpesa_payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mpesa_payment_events_tenant_select ON mpesa_payment_events;
CREATE POLICY mpesa_payment_events_tenant_select ON mpesa_payment_events
  FOR SELECT USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS mpesa_payment_events_tenant_insert ON mpesa_payment_events;
CREATE POLICY mpesa_payment_events_tenant_insert ON mpesa_payment_events
  FOR INSERT WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS mpesa_payment_events_tenant_update ON mpesa_payment_events;
CREATE POLICY mpesa_payment_events_tenant_update ON mpesa_payment_events
  FOR UPDATE USING (church_id::text = app_church_id())
  WITH CHECK (church_id::text = app_church_id());

-- Service-role webhook processing bypasses RLS; browser clients never receive
-- service credentials. This table is deliberately not exposed as a public API.
