-- People Management foundation: households, follow-ups, and lifecycle history.
-- Security-first: all new tables are RLS protected and anonymous RPC access is removed.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  primary_member_id uuid references public.members(id) on delete set null,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  church_id uuid not null references public.churches(id) on delete cascade,
  relationship text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (household_id, member_id)
);

create table if not exists public.member_follow_ups (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  type text not null default 'GENERAL',
  status text not null default 'OPEN' check (status in ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  notes text,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_status_history (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  old_status text,
  new_status text not null,
  reason text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists households_church_id_idx on public.households(church_id);
create index if not exists household_members_church_id_idx on public.household_members(church_id);
create index if not exists household_members_member_id_idx on public.household_members(member_id);
create index if not exists member_follow_ups_church_member_idx on public.member_follow_ups(church_id, member_id, status);
create index if not exists member_follow_ups_due_idx on public.member_follow_ups(church_id, due_at) where status in ('OPEN','IN_PROGRESS');
create index if not exists member_status_history_member_idx on public.member_status_history(church_id, member_id, changed_at desc);
create index if not exists members_church_name_idx on public.members(church_id, last_name, first_name);
create index if not exists members_church_phone_idx on public.members(church_id, phone);
create index if not exists members_church_status_idx on public.members(church_id, status);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.member_follow_ups enable row level security;
alter table public.member_status_history enable row level security;

create policy households_select on public.households for select to authenticated using ((select public.is_church_member(church_id)));
create policy households_manage on public.households for all to authenticated using ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF')) with check ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF'));
create policy household_members_select on public.household_members for select to authenticated using ((select public.is_church_member(church_id)));
create policy household_members_manage on public.household_members for all to authenticated using ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF')) with check ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF'));
create policy member_follow_ups_select on public.member_follow_ups for select to authenticated using ((select public.is_church_member(church_id)));
create policy member_follow_ups_manage on public.member_follow_ups for all to authenticated using ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF')) with check ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF'));
create policy member_status_history_select on public.member_status_history for select to authenticated using ((select public.is_church_member(church_id)));
create policy member_status_history_insert on public.member_status_history for insert to authenticated with check ((select public.church_membership_role(church_id)) in ('ADMIN','PASTOR','STAFF'));

revoke all on table public.households, public.household_members, public.member_follow_ups, public.member_status_history from anon;
grant select, insert, update, delete on table public.households, public.household_members, public.member_follow_ups to authenticated;
grant select, insert on table public.member_status_history to authenticated;

revoke execute on function public.admin_create_church_invitation(uuid,text,text,integer) from anon;
revoke execute on function public.admin_list_church_memberships(uuid) from anon;
revoke execute on function public.admin_set_membership_role(uuid,text) from anon;
revoke execute on function public.admin_set_membership_status(uuid,text) from anon;
revoke execute on function public.admin_set_onboarding_step(uuid,text) from anon;
revoke execute on function public.admin_update_church_profile(uuid,text,text,text,text,text,text) from anon;
revoke execute on function public.church_membership_role(uuid) from anon;
revoke execute on function public.is_church_member(uuid) from anon;

alter function public.update_updated_at() set search_path = public, pg_catalog;
alter function public.get_member_counts_v2(uuid[]) set search_path = public, pg_catalog;
alter function public.provision_tenant_church(text,text,text,text,text) set search_path = public, pg_catalog;
alter function public.member_age(text) set search_path = public, pg_catalog;
alter view public.active_members set (security_invoker = true);
alter view public.active_transactions set (security_invoker = true);
