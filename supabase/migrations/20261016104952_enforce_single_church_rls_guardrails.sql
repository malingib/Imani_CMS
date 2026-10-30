begin;

-- Enable RLS for the only church-scoped table that was not protected.
alter table public.member_change_log enable row level security;

-- Change history contains before/after values, so only active church managers
-- may read it. Keep logs append-only through the Data API.
drop policy if exists member_change_log_manager_read on public.member_change_log;
create policy member_change_log_manager_read
  on public.member_change_log
  for select
  to authenticated
  using (
    is_church_member(church_id)
    and church_membership_role(church_id) = any (array['ADMIN','PASTOR','STAFF']::text[])
  );

drop policy if exists member_change_log_manager_insert on public.member_change_log;
create policy member_change_log_manager_insert
  on public.member_change_log
  for insert
  to authenticated
  with check (
    is_church_member(church_id)
    and church_membership_role(church_id) = any (array['ADMIN','PASTOR','STAFF']::text[])
  );

-- Fail closed if the canonical church is not the one expected.
do $preflight$
begin
  if not exists (
    select 1 from public.churches
    where id = '00000000-0000-0000-0000-000000000001'::uuid
      and name = 'Demo Church'
  ) then
    raise exception 'Canonical Demo Church safety check failed; no policies applied.';
  end if;
end
$preflight$;

-- Add restrictive canonical-church predicates to every public base table
-- carrying church_id. Existing role/permission policies remain in force.
do $guard$
declare
  t record;
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
    if not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public'
        and p.tablename = t.table_name
        and p.policyname = 'imani_canonical_church_guard'
    ) then
      execute format(
        'create policy imani_canonical_church_guard on public.%I as restrictive for all to public using (church_id = %L::uuid) with check (church_id = %L::uuid)',
        t.table_name, canonical_id, canonical_id
      );
    end if;
  end loop;

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

-- Postcondition: no church-scoped public table may remain without RLS or guard.
do $postcheck$
declare
  bad_table text;
begin
  select c.table_name into bad_table
  from information_schema.columns c
  join information_schema.tables bt
    on bt.table_schema = c.table_schema
   and bt.table_name = c.table_name
   and bt.table_type = 'BASE TABLE'
  join pg_class pc on pc.relname = c.table_name
  join pg_namespace pn on pn.oid = pc.relnamespace and pn.nspname = c.table_schema
  where c.table_schema = 'public'
    and c.column_name = 'church_id'
    and (
      not pc.relrowsecurity
      or not exists (
        select 1 from pg_policies p
        where p.schemaname = 'public'
          and p.tablename = c.table_name
          and p.policyname = 'imani_canonical_church_guard'
      )
    )
  limit 1;

  if bad_table is not null then
    raise exception 'Postcheck failed: public.% lacks RLS or canonical guard.', bad_table;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'churches'
      and policyname = 'imani_canonical_church_guard'
  ) then
    raise exception 'Postcheck failed: churches canonical guard missing.';
  end if;
end
$postcheck$;

commit;
