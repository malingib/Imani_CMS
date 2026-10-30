
alter table public.churches
  add column if not exists billing_status text not null default 'trial',
  add column if not exists monthly_fee numeric(12,2) not null default 0,
  add column if not exists billing_currency text not null default 'KES',
  add column if not exists billing_period_end timestamptz,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text,
  add column if not exists restrictions jsonb not null default '{}'::jsonb,
  add column if not exists minimum_client_version text,
  add column if not exists latest_client_version text;

create table if not exists public.platform_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  title text not null,
  notes text not null default '',
  release_channel text not null default 'stable' check (release_channel in ('stable','beta')),
  status text not null default 'draft' check (status in ('draft','published','required','rolled_back')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.platform_releases enable row level security;
drop policy if exists platform_releases_superadmin_all on public.platform_releases;
create policy platform_releases_superadmin_all on public.platform_releases
  for all using (public.app_role() = 'SUPER_ADMIN')
  with check (public.app_role() = 'SUPER_ADMIN');

grant select, insert, update, delete on public.platform_releases to authenticated;

create index if not exists platform_releases_status_published_idx
  on public.platform_releases(status, published_at desc);
