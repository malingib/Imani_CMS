-- Idempotent outbound MobiWave SMS dispatches. The API token remains in Supabase Vault;
-- this table stores only a message hash, recipient count and provider outcome.
BEGIN;

CREATE TABLE IF NOT EXISTS public.sms_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL,
  message_hash text NOT NULL,
  recipient_count integer NOT NULL CHECK (recipient_count > 0 AND recipient_count <= 1000),
  status text NOT NULL DEFAULT 'initiating'
    CHECK (status IN ('initiating','sent','failed','verification_required')),
  provider_message_id text,
  result_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_dispatches_church_idempotency_unique UNIQUE (church_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS sms_dispatches_church_created_idx
  ON public.sms_dispatches (church_id, created_at DESC);

ALTER TABLE public.sms_dispatches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sms_dispatches FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.sms_dispatches TO service_role;

CREATE OR REPLACE FUNCTION public.set_sms_dispatch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_sms_dispatch_updated_at ON public.sms_dispatches;
CREATE TRIGGER set_sms_dispatch_updated_at
BEFORE UPDATE ON public.sms_dispatches
FOR EACH ROW EXECUTE FUNCTION public.set_sms_dispatch_updated_at();

COMMIT;
