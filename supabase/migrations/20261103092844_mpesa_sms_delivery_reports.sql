ALTER TABLE public.mpesa_payment_intents
  ADD COLUMN IF NOT EXISTS sms_provider_status text,
  ADD COLUMN IF NOT EXISTS sms_last_checked_at timestamptz;

ALTER TABLE public.mpesa_payment_intents
  DROP CONSTRAINT IF EXISTS mpesa_payment_intents_sms_status_check;

ALTER TABLE public.mpesa_payment_intents
  ADD CONSTRAINT mpesa_payment_intents_sms_status_check
  CHECK (sms_status IN ('not_sent','sent','delivered','failed','not_configured'));
