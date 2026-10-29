create table if not exists public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('platform','church')),
  church_id uuid null references public.churches(id) on delete cascade,
  provider text not null check (provider in ('daraja','mobiwave_sms')),
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  secret_ciphertext text null,
  secret_iv text null,
  updated_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_credentials_scope_church_check check (
    (scope = 'platform' and church_id is null) or (scope = 'church' and church_id is not null)
  ),
  constraint integration_credentials_unique_scope_provider unique (scope, church_id, provider)
);
alter table public.integration_credentials enable row level security;
revoke all on public.integration_credentials from anon, authenticated;
comment on table public.integration_credentials is 'Server-only integration configuration. Access only through the authenticated integration-config Edge Function; never expose secret ciphertext to clients.';
create unique index if not exists integration_credentials_scope_provider_unique_idx
  on public.integration_credentials (scope, coalesce(church_id, '00000000-0000-0000-0000-000000000000'::uuid), provider);
