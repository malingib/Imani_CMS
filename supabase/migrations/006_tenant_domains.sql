-- Domain registry for multi-tenant routing.
CREATE TABLE IF NOT EXISTS tenant_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  hostname VARCHAR(255) NOT NULL,
  domain_type VARCHAR(20) NOT NULL DEFAULT 'SUBDOMAIN'
    CHECK (domain_type IN ('SUBDOMAIN', 'CUSTOM')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  primary_domain BOOLEAN NOT NULL DEFAULT FALSE,
  ssl_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (ssl_status IN ('PENDING', 'ACTIVE', 'ERROR')),
  verification_token VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tenant_domains_hostname
  ON tenant_domains(lower(hostname));
CREATE INDEX IF NOT EXISTS idx_tenant_domains_church
  ON tenant_domains(church_id, verified);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tenant_domains_primary
  ON tenant_domains(church_id)
  WHERE primary_domain = TRUE;

CREATE OR REPLACE FUNCTION set_tenant_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenant_domains_updated_at ON tenant_domains;
CREATE TRIGGER trg_tenant_domains_updated_at
  BEFORE UPDATE ON tenant_domains
  FOR EACH ROW EXECUTE FUNCTION set_tenant_domains_updated_at();

ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_domains_select ON tenant_domains;
CREATE POLICY tenant_domains_select ON tenant_domains
  FOR SELECT USING (church_id::text = app_church_id());

DROP POLICY IF EXISTS tenant_domains_insert ON tenant_domains;
CREATE POLICY tenant_domains_insert ON tenant_domains
  FOR INSERT WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS tenant_domains_update ON tenant_domains;
CREATE POLICY tenant_domains_update ON tenant_domains
  FOR UPDATE USING (church_id::text = app_church_id())
  WITH CHECK (church_id::text = app_church_id());

DROP POLICY IF EXISTS tenant_domains_delete ON tenant_domains;
CREATE POLICY tenant_domains_delete ON tenant_domains
  FOR DELETE USING (church_id::text = app_church_id());
