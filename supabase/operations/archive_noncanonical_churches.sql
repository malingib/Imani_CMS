-- Imani single-church migration: additive archive snapshot only.
-- DO NOT execute against production until the backup/restore gate is complete.
-- This script does not delete or update source rows and does not change RLS on
-- operational tables. Test against a restored staging database first.

begin;

create schema if not exists imani_archive;
revoke all on schema imani_archive from public, anon, authenticated;
grant usage on schema imani_archive to service_role;

create table if not exists imani_archive.row_snapshots (
  id bigint generated always as identity primary key,
  batch_id uuid not null,
  source_table text not null,
  church_id uuid not null,
  source_pk jsonb not null,
  row_hash text not null,
  row_data jsonb not null,
  archived_at timestamptz not null default now()
);

-- Upgrade-safe idempotency key: identical rows in different churches must not collide.
alter table imani_archive.row_snapshots
  drop constraint if exists imani_archive_row_snapshots_source_hash_key;
create unique index if not exists imani_archive_row_snapshots_source_church_hash_uidx
  on imani_archive.row_snapshots (source_table, church_id, row_hash);

create table if not exists imani_archive.church_records (
  church_id uuid primary key,
  church_name text not null,
  row_hash text not null,
  row_data jsonb not null,
  archived_at timestamptz not null default now()
);

alter table imani_archive.row_snapshots enable row level security;
alter table imani_archive.church_records enable row level security;
revoke all on imani_archive.row_snapshots from public, anon, authenticated;
revoke all on imani_archive.church_records from public, anon, authenticated;
grant select, insert on imani_archive.row_snapshots to service_role;
grant usage, select on sequence imani_archive.row_snapshots_id_seq to service_role;
grant select, insert on imani_archive.church_records to service_role;

do $archive$
declare
  canonical_id constant uuid := '00000000-0000-0000-0000-000000000001';
  canonical_name constant text := 'Demo Church';
  run_id uuid := gen_random_uuid();
  t record;
  pk_expression text;
  insert_sql text;
begin
  if not exists (
    select 1 from public.churches
    where id = canonical_id and name = canonical_name
  ) then
    raise exception 'Safety check failed: expected canonical Demo Church record was not found';
  end if;

  -- Snapshot the non-canonical church registry records without changing them.
  insert into imani_archive.church_records (church_id, church_name, row_hash, row_data)
  select c.id, c.name, md5(to_jsonb(c)::text), to_jsonb(c)
  from public.churches c
  where c.id <> canonical_id
  on conflict (church_id) do nothing;

  -- Only base tables are snapshotted; views are derived data and are excluded.
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
    -- Store primary-key columns as JSON. The full row JSON is also retained.
    select string_agg(
      format('%L, to_jsonb(t)->%L', a.attname, a.attname),
      ', ' order by k.ord
    )
    into pk_expression
    from pg_index i
    cross join lateral unnest(i.indkey) with ordinality as k(attnum, ord)
    join pg_attribute a
      on a.attrelid = i.indrelid
     and a.attnum = k.attnum
    where i.indrelid = format('public.%I', t.table_name)::regclass
      and i.indisprimary;

    if pk_expression is null then
      raise exception 'Safety check failed: public.% has no primary key', t.table_name;
    end if;

    insert_sql := format(
      'insert into imani_archive.row_snapshots
         (batch_id, source_table, church_id, source_pk, row_hash, row_data)
       select $1, %L, (to_jsonb(t)->>''church_id'')::uuid,
              jsonb_build_object(%s), md5(to_jsonb(t)::text), to_jsonb(t)
       from public.%I t
       where (to_jsonb(t)->>''church_id'') is not null
         and (to_jsonb(t)->>''church_id'')::uuid <> $2
       on conflict (source_table, church_id, row_hash) do nothing',
      t.table_name, pk_expression, t.table_name
    );

    execute insert_sql using run_id, canonical_id;
  end loop;
end
$archive$;

-- Intentionally no DELETE, UPDATE of source rows, or DROP statements here.
-- Review these reports before authorizing any later cleanup.
select source_table, church_id, count(*) as archived_rows
from imani_archive.row_snapshots
group by source_table, church_id
order by source_table, church_id;

select church_id, church_name, archived_at
from imani_archive.church_records
order by church_name;

commit;
