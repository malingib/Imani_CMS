BEGIN;
CREATE TABLE IF NOT EXISTS public.mpesa_payment_intents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE RESTRICT,
 created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT, payer_name text NOT NULL DEFAULT '',
 phone_number text NOT NULL, amount numeric(12,2) NOT NULL CHECK (amount>=1 AND amount<=250000 AND amount=trunc(amount)),
 purpose text NOT NULL CHECK (purpose IN ('Tithe','Offering','Project','Harambee','Benevolence')), account_reference text NOT NULL,
 callback_token_hash text NOT NULL, reconcile_token_hash text,
 status text NOT NULL DEFAULT 'initiating' CHECK (status IN ('initiating','pending','reconciliation_pending','succeeded','failed','verification_required')),
 merchant_request_id text, checkout_request_id text UNIQUE, mpesa_receipt_number text UNIQUE,
 reconciliation_conversation_id text, reconciliation_status text, result_code integer, result_description text, callback_payload jsonb,
 transaction_date timestamptz, sms_status text NOT NULL DEFAULT 'not_sent' CHECK (sms_status IN ('not_sent','sent','failed','not_configured')),
 sms_provider_message_id text, sms_error text, receipt_sms_sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mpesa_payment_intents_church_created_idx ON public.mpesa_payment_intents(church_id,created_at DESC);
CREATE INDEX IF NOT EXISTS mpesa_payment_intents_status_idx ON public.mpesa_payment_intents(status,created_at DESC);
ALTER TABLE public.mpesa_payment_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.mpesa_payment_intents FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.set_mpesa_payment_intent_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at=now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS set_mpesa_payment_intent_updated_at ON public.mpesa_payment_intents;
CREATE TRIGGER set_mpesa_payment_intent_updated_at BEFORE UPDATE ON public.mpesa_payment_intents FOR EACH ROW EXECUTE FUNCTION public.set_mpesa_payment_intent_updated_at();
CREATE UNIQUE INDEX IF NOT EXISTS transactions_integrated_mpesa_reference_unique ON public.transactions(reference) WHERE source='INTEGRATED' AND payment_method='M-Pesa' AND reference IS NOT NULL;
COMMIT;
