-- Imani single-church authorization guardrails.
-- STAGING ONLY until the archive snapshot and baseline verification pass.
-- This migration intentionally fails closed if a church-scoped base table has
-- RLS disabled; write and test a table-specific policy before rerunning.
-- It preserves existing permissive role policies and adds restrictive church
-- predicates, so SUPER_ADMIN cannot bypass the canonical-church boundary.

begin;

do $preflight$
declare
  disabled_table text;
begin
  if not exists (
    select 1 from public.churches
    where id = '00000000-0000-0000-0000-000000000001'::uuid
      and name = 'Demo Church'
  ) then
    raise exception 'Canonical Demo Church safety check failed.';
  end if;

  select c.table_name
    into disabled_table
  from information_schema.columns c
  join information_schema.tables bt
    on bt.table_schema = c.table_schema
   and bt.table_name = c.table_name
   and bt.table_type = 'BASE TABLE'
  join pg_class pc
    on pc.relname = c.table_name
  join pg_namespace pn
    on pn.oid = pc.relnamespace
   and pn.nspname = c.table_schema
  where c.table_schema = 'public'
    and c.column_name = 'church_id'
    and not pc.relrowsecurity
  order by c.table_name
  limit 1;

  if disabled_table is not null then
    raise exception
      'Safety stop: public.% has church_id but RLS is disabled. Add and test its table-specific policy before applying canonical guards.',
      disabled_table;
  end if;
end
$preflight$;

do $guard$
declare
  t record;
  policy_name text;
  canonical_id constant uuid := '00000000-0000-0000-0000-000000000001';
begin
  for t in
    select distinct c.table_name
    from information_schema.columns c
    join information_schema.tables bt
      on bt.table_schema = c.table_schema
     and bt.table_name = c.table_name
     and bt.table_type = 'BASE TABLE'
    where c.table_schema = 'public'
      and c.column_name = 'church_id'
    order by c.table_name
  loop
    policy_name := 'imani_canonical_church_guard';
    if not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public'
        and p.tablename = t.table_name
        and p.policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I as restrictive for all to public using (church_id = %L::uuid) with check (church_id = %L::uuid)',
        policy_name, t.table_name, canonical_id, canonical_id
      );
    end if;
  end loop;

  -- Church registry has id rather than church_id. Keep the canonical row
  -- visible and mutable under the existing role-specific permissive policies.
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'churches'
      and p.policyname = 'imani_canonical_church_guard'
  ) then
    execute format(
      'create policy imani_canonical_church_guard on public.churches as restrictive for all to public using (id = %L::uuid) with check (id = %L::uuid)',
      canonical_id, canonical_id
    );
  end if;
end
$guard$;

-- Keep the three non-canonical registry rows and their operational data.
-- This status makes them visibly archived; it is not the access-control boundary.
alter table public.churches drop constraint if exists churches_status_check;
alter table public.churches
  add constraint churches_status_check
  check (status = any (array['active','suspended','trialing','onboarding','archived']::text[]));

update public.churches
set status = 'archived'
where id <> '00000000-0000-0000-0000-000000000001'::uuid
  and status <> 'archived';

commit;

-- Post-checks to run immediately after this migration:
-- 1. Confirm all church_id base tables have RLS enabled.
-- 2. Confirm canonical guard policy exists on each such table and public.churches.
-- 3. Test anon, normal authenticated member, ADMIN, and legacy SUPER_ADMIN via
--    the Data API; non-canonical rows must be invisible and unmodifiable.
-- 4. Verify expected canonical workflows. Do not drop church_id or memberships
--    in this migration; those dependencies are removed in a separate cutover.
