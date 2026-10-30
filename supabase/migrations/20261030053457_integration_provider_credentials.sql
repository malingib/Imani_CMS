-- Reconcile historical RLS guards with the role-specific policies. The
-- canonical boundary must be restrictive; a permissive ALL policy grants any
-- active member CRUD access regardless of the role-specific policy set.
BEGIN;

DO $guard$
DECLARE
  p record;
  canonical_id constant uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  FOR p IN
    SELECT schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname = 'imani_canonical_church_guard'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', 'imani_canonical_church_guard', p.schemaname, p.tablename);
    IF p.tablename = 'churches' THEN
      EXECUTE format(
        'CREATE POLICY imani_canonical_church_guard ON %I.%I AS RESTRICTIVE FOR ALL TO public USING (id = %L::uuid) WITH CHECK (id = %L::uuid)',
        p.schemaname, p.tablename, canonical_id, canonical_id
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY imani_canonical_church_guard ON %I.%I AS RESTRICTIVE FOR ALL TO public USING (church_id = %L::uuid) WITH CHECK (church_id = %L::uuid)',
        p.schemaname, p.tablename, canonical_id, canonical_id
      );
    END IF;
  END LOOP;
END;
$guard$;

-- These helpers are consumed by authenticated RLS policies, never by anon.
-- Revoke PUBLIC as well as anon because PUBLIC grants are inherited.
REVOKE ALL ON FUNCTION public.app_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.app_church_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_church_member(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.church_membership_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_church_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_church_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.church_membership_role(UUID) TO authenticated;

-- Provider credentials live in Vault. The metadata table is outside the API
-- exposed schema; only service-role RPCs may read or change the secret IDs.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS private.integration_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('platform', 'church')),
  church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('mpesa', 'mobiwave')),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(settings) = 'object'),
  secret_id uuid NOT NULL REFERENCES vault.secrets(id),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope = 'platform' AND church_id IS NULL) OR (scope = 'church' AND church_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS integration_provider_configs_platform_unique
  ON private.integration_provider_configs (provider) WHERE scope = 'platform';
CREATE UNIQUE INDEX IF NOT EXISTS integration_provider_configs_church_unique
  ON private.integration_provider_configs (church_id, provider) WHERE scope = 'church';
ALTER TABLE private.integration_provider_configs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.integration_provider_configs FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.integration_config_get(
  p_scope text,
  p_church_id uuid,
  p_provider text
)
RETURNS TABLE(settings jsonb, secret jsonb, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, private, vault
AS $$
  SELECT c.settings, d.decrypted_secret::jsonb, c.updated_at
  FROM private.integration_provider_configs c
  JOIN vault.decrypted_secrets d ON d.id = c.secret_id
  WHERE c.scope = p_scope
    AND c.church_id IS NOT DISTINCT FROM p_church_id
    AND c.provider = p_provider
$$;

CREATE OR REPLACE FUNCTION public.integration_config_save(
  p_scope text,
  p_church_id uuid,
  p_provider text,
  p_settings jsonb,
  p_secret jsonb,
  p_updated_by uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, private, vault
AS $$
DECLARE
  v_name text;
  v_secret_id uuid;
  v_secret_text text;
  v_church_key text;
BEGIN
  IF p_scope IS NULL OR p_provider IS NULL OR p_settings IS NULL OR p_secret IS NULL
     OR p_scope NOT IN ('platform', 'church')
     OR p_provider NOT IN ('mpesa', 'mobiwave')
     OR jsonb_typeof(p_settings) <> 'object'
     OR jsonb_typeof(p_secret) <> 'object'
     OR (p_scope = 'platform' AND p_church_id IS NOT NULL)
     OR (p_scope = 'church' AND p_church_id IS NULL) THEN
    RAISE EXCEPTION 'Invalid integration configuration';
  END IF;

  v_church_key := COALESCE(p_church_id::text, 'platform');
  v_name := 'imani:' || p_scope || ':' || v_church_key || ':' || p_provider;
  v_secret_text := p_secret::text;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_name, 0));

  SELECT secret_id INTO v_secret_id
  FROM private.integration_provider_configs
  WHERE scope = p_scope AND church_id IS NOT DISTINCT FROM p_church_id AND provider = p_provider
  FOR UPDATE;

  IF v_secret_id IS NULL THEN
    SELECT vault.create_secret(v_secret_text, v_name, 'Imani CMS ' || p_scope || ' ' || p_provider || ' credentials')
    INTO v_secret_id;
  ELSE
    PERFORM vault.update_secret(v_secret_id, v_secret_text, v_name,
      'Imani CMS ' || p_scope || ' ' || p_provider || ' credentials');
  END IF;

  IF v_secret_id IS NULL THEN RAISE EXCEPTION 'Unable to store integration credentials'; END IF;

  UPDATE private.integration_provider_configs
  SET settings = p_settings, secret_id = v_secret_id, updated_by = p_updated_by, updated_at = now()
  WHERE scope = p_scope AND church_id IS NOT DISTINCT FROM p_church_id AND provider = p_provider;

  IF NOT FOUND THEN
    INSERT INTO private.integration_provider_configs(scope, church_id, provider, settings, secret_id, updated_by)
    VALUES (p_scope, p_church_id, p_provider, p_settings, v_secret_id, p_updated_by);
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.integration_config_get(text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.integration_config_save(text, uuid, text, jsonb, jsonb, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.integration_config_get(text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.integration_config_save(text, uuid, text, jsonb, jsonb, uuid) TO service_role;

COMMIT;
