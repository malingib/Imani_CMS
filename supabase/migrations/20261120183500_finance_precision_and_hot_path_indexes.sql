-- Standardize church financial precision and index the primary tenant-scoped read paths.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.transactions
    WHERE amount IS NOT NULL
      AND (abs(amount) > 999999999999.99 OR amount <> round(amount, 2))
  ) THEN
    RAISE EXCEPTION 'transactions.amount contains values outside numeric(14,2); remediate before applying this migration';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.budgets
    WHERE (amount IS NOT NULL AND (abs(amount) > 999999999999.99 OR amount <> round(amount, 2)))
       OR (spent IS NOT NULL AND (abs(spent) > 999999999999.99 OR spent <> round(spent, 2)))
  ) THEN
    RAISE EXCEPTION 'budgets contains values outside numeric(14,2); remediate before applying this migration';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.recurring_expenses
    WHERE amount IS NOT NULL
      AND (abs(amount) > 999999999999.99 OR amount <> round(amount, 2))
  ) THEN
    RAISE EXCEPTION 'recurring_expenses.amount contains values outside numeric(14,2); remediate before applying this migration';
  END IF;
END;
$$;

ALTER TABLE public.transactions
  ALTER COLUMN amount TYPE numeric(14,2) USING amount::numeric(14,2);
ALTER TABLE public.budgets
  ALTER COLUMN amount TYPE numeric(14,2) USING amount::numeric(14,2),
  ALTER COLUMN spent TYPE numeric(14,2) USING spent::numeric(14,2);
ALTER TABLE public.recurring_expenses
  ALTER COLUMN amount TYPE numeric(14,2) USING amount::numeric(14,2);

CREATE INDEX IF NOT EXISTS transactions_church_date_active_idx
  ON public.transactions (church_id, date DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_church_created_active_idx
  ON public.transactions (church_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS members_church_created_active_idx
  ON public.members (church_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS church_events_church_date_idx
  ON public.church_events (church_id, date DESC);
CREATE INDEX IF NOT EXISTS audit_logs_church_created_idx
  ON public.audit_logs (church_id, created_at DESC);
