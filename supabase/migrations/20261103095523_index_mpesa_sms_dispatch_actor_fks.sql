-- Cover actor foreign keys for the service-only payment and SMS dispatch ledgers.
CREATE INDEX IF NOT EXISTS mpesa_payment_intents_created_by_idx
  ON public.mpesa_payment_intents (created_by);
CREATE INDEX IF NOT EXISTS sms_dispatches_created_by_idx
  ON public.sms_dispatches (created_by);
