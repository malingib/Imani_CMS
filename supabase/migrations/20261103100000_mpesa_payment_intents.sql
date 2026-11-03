-- Church-staff initiated M-Pesa collections. This schema deliberately has no member_id
-- or member-portal ownership: every payment belongs to a church workspace.
BEGIN;

CREATE TABLE IF NOT EXISTS public.mpesa_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payer_name text,
  phone_number text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 1 AND amount <= 250000 AND amount = trunc(amount)),
  purpose text NOT NULL CHECK (purpose IN ('Tithe','Offering','Project','Harambee','Benevolence')),
  account_reference text NOT NULL,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'initiating'
    CHECK (status IN ('initiating','pending','succeeded','failed','verification_required')),
  merchant_request_id text,
  checkout_request_id text UNIQUE,
  mpesa_receipt_number text UNIQUE,
  callback_token_hash text NOT NULL,
  result_code integer,
  result_description text,
  callback_payload jsonb,
  transaction_date timestamptz,
  callback_received_at timestamptz,
  ledger_posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mpesa_payment_intents_church_idempotency_unique UNIQUE (church_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS mpesa_payment_intents_church_created_idx
  ON public.mpesa_payment_intents (church_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mpesa_payment_intents_status_created_idx
  ON public.mpesa_payment_intents (status, created_at DESC);

ALTER TABLE public.mpesa_payment_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.mpesa_payment_intents FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.mpesa_payment_intents TO service_role;

-- A Safaricom receipt can create at most one integrated M-Pesa ledger entry.
CREATE UNIQUE INDEX IF NOT EXISTS transactions_integrated_mpesa_reference_unique
  ON public.transactions (reference)
  WHERE source = 'INTEGRATED' AND payment_method = 'M-Pesa' AND reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_mpesa_payment_intent_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_mpesa_payment_intent_updated_at ON public.mpesa_payment_intents;
CREATE TRIGGER set_mpesa_payment_intent_updated_at
BEFORE UPDATE ON public.mpesa_payment_intents
FOR EACH ROW EXECUTE FUNCTION public.set_mpesa_payment_intent_updated_at();

-- The callback is processed atomically: a verified receipt and its ledger row commit together.
CREATE OR REPLACE FUNCTION public.record_mpesa_stk_callback(
  p_checkout_request_id text,
  p_result_code integer,
  p_result_description text,
  p_amount numeric,
  p_receipt text,
  p_phone text,
  p_callback_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_intent public.mpesa_payment_intents%ROWTYPE;
  v_rows integer;
BEGIN
  SELECT * INTO v_intent
  FROM public.mpesa_payment_intents
  WHERE checkout_request_id = p_checkout_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_intent.status = 'succeeded' AND v_intent.ledger_posted_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'succeeded', 'receipt_number', v_intent.mpesa_receipt_number);
  END IF;

  IF p_result_code IS DISTINCT FROM 0 THEN
    UPDATE public.mpesa_payment_intents
    SET status = 'failed',
        result_code = p_result_code,
        result_description = left(coalesce(p_result_description, 'M-Pesa request failed'), 500),
        callback_payload = p_callback_payload,
        callback_received_at = now()
    WHERE id = v_intent.id;
    RETURN jsonb_build_object('status', 'failed');
  END IF;

  IF p_receipt IS NULL OR length(trim(p_receipt)) = 0
     OR p_amount IS DISTINCT FROM v_intent.amount
     OR p_phone IS DISTINCT FROM v_intent.phone_number THEN
    UPDATE public.mpesa_payment_intents
    SET status = 'verification_required',
        result_code = p_result_code,
        result_description = 'Callback metadata did not match the original payment request. Reconciliation is required.',
        callback_payload = p_callback_payload,
        callback_received_at = now()
    WHERE id = v_intent.id;
    RETURN jsonb_build_object('status', 'verification_required');
  END IF;

  UPDATE public.mpesa_payment_intents
  SET status = 'succeeded',
      mpesa_receipt_number = p_receipt,
      result_code = p_result_code,
      result_description = left(coalesce(p_result_description, 'Payment confirmed'), 500),
      callback_payload = p_callback_payload,
      transaction_date = now(),
      callback_received_at = now()
  WHERE id = v_intent.id;

  INSERT INTO public.transactions (
    church_id, member_id, member_name, amount, type, payment_method, date,
    reference, category, notes, phone_number, source
  )
  VALUES (
    v_intent.church_id, NULL, v_intent.payer_name, v_intent.amount,
    v_intent.purpose, 'M-Pesa',
    (now() AT TIME ZONE 'Africa/Nairobi')::date,
    p_receipt, 'Income', 'Confirmed via M-Pesa STK Push',
    v_intent.phone_number, 'INTEGRATED'
  )
  ON CONFLICT (reference)
    WHERE source = 'INTEGRATED' AND payment_method = 'M-Pesa' AND reference IS NOT NULL
  DO NOTHING;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 AND NOT EXISTS (
    SELECT 1 FROM public.transactions
    WHERE reference = p_receipt
      AND source = 'INTEGRATED'
      AND payment_method = 'M-Pesa'
      AND church_id = v_intent.church_id
  ) THEN
    RAISE EXCEPTION 'M-Pesa receipt is already associated with a different ledger entry';
  END IF;

  UPDATE public.mpesa_payment_intents
  SET ledger_posted_at = now()
  WHERE id = v_intent.id;

  RETURN jsonb_build_object('status', 'succeeded', 'receipt_number', p_receipt);
END;
$$;

REVOKE ALL ON FUNCTION public.record_mpesa_stk_callback(text, integer, text, numeric, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_mpesa_stk_callback(text, integer, text, numeric, text, text, jsonb)
  TO service_role;

COMMIT;
