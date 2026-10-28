-- M-Pesa STK Push payment intents for Imani CMS.
-- Intents are isolated by church and are not visible to anon/authenticated clients directly.
create table if not exists public.mpesa_payment_intents (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete restrict,
  member_id uuid references public.members(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  phone_number text not null,
  amount numeric(12,2) not null check (amount >= 1 and amount <= 250000 and amount = trunc(amount)),
  purpose text not null check (char_length(purpose) between 1 and 120),
  account_reference text not null,
  status text not null default 'initiating'
    check (status in ('initiating','pending','succeeded','failed','verification_required')),
  merchant_request_id text,
  checkout_request_id text unique,
  mpesa_receipt_number text unique,
  result_code integer,
  result_description text,
  callback_payload jsonb,
  transaction_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mpesa_payment_intents_church_created_idx
  on public.mpesa_payment_intents(church_id, created_at desc);
create index if not exists mpesa_payment_intents_status_idx
  on public.mpesa_payment_intents(status, created_at desc);

alter table public.mpesa_payment_intents enable row level security;
revoke all on public.mpesa_payment_intents from anon, authenticated;
revoke all on public.mpesa_payment_intents from anon, authenticated;
-- Status is exposed through the authenticated mpesa-status Edge Function only, so
-- checkout IDs, phone numbers, callback payloads, and receipts are not directly readable.

create or replace function public.set_mpesa_payment_intent_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_mpesa_payment_intent_updated_at on public.mpesa_payment_intents;
create trigger set_mpesa_payment_intent_updated_at
before update on public.mpesa_payment_intents
for each row execute function public.set_mpesa_payment_intent_updated_at();
