-- Add idempotent STK request correlation and durable MobiWave SMS dispatch records.
-- Provider credentials remain in the existing Supabase Vault-backed integration settings.
BEGIN;

ALTER TABLE public.mpesa_payment_intents
  ADD COLUMN IF NOT EXISTS idempotency_key text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mpesa_payment_intents_idempotency_key_length'
      AND conrelid = 'public.mpesa_payment_intents'::regclass
  ) THEN
    ALTER TABLE public.mpesa_payment_intents
      ADD CONSTRAINT mpesa_payment_intents_idempotency_key_length
      CHECK (idempotency_key IS NULL OR length(idempotency_key) BETWEEN 8 AND 128);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS mpesa_payment_intents_church_idempotency_unique
  ON public.mpesa_payment_intents (church_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.sms_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  message_hash text NOT NULL,
  recipient_count integer NOT NULL CHECK (recipient_count BETWEEN 1 AND 1000),
  status text NOT NULL DEFAULT 'initiating'
    CHECK (status IN ('initiating', 'sent', 'failed', 'verification_required')),
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
