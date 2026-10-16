-- Imani archive verification report (read-only with respect to persistent data).
-- Run only AFTER archive_noncanonical_churches.sql on a restored staging copy.
-- This script creates a session-local temporary report table; it does not modify
-- source tables or the persistent archive. Review every mismatch before cleanup.

do $preflight$
begin
  if to_regclass('imani_archive.row_snapshots') is null
     or to_regclass('imani_archive.church_records') is null then
    raise exception 'Archive tables not found. Run the additive archive snapshot on staging first.';
  end if;
  if not exists (
    select 1 from public.churches
    where id = '00000000-0000-0000-0000-000000000001'::uuid
      and name = 'Demo Church'
  ) then
    raise exception 'Canonical Demo Church safety check failed.';
  end if;
end
$preflight$;

create temporary table if not exists imani_archive_verification_report (
  source_table text not null,
  church_id uuid not null,
  source_rows bigint not null,
  archived_rows bigint not null,
  source_rows_missing_snapshot bigint not null,
  archived_rows_not_currently_matching_source bigint not null
) on commit preserve rows;

truncate table imani_archive_verification_report;

do $verify$
declare
  canonical_id constant uuid := '00000000-0000-0000-0000-000000000001';
  t record;
  pk_expression text;
  verify_sql text;
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
    select string_agg(
      format('%L, to_jsonb(src)->%L', a.attname, a.attname),
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
      raise exception 'Verification stopped: public.% has no primary key', t.table_name;
    end if;

    verify_sql := format($sql$
      with church_ids as (
        select distinct (to_jsonb(src)->>'church_id')::uuid as church_id
        from public.%1$I src
        where (to_jsonb(src)->>'church_id') is not null
          and (to_jsonb(src)->>'church_id')::uuid <> $1
        union
        select distinct a.church_id
        from imani_archive.row_snapshots a
        where a.source_table = %2$L
          and a.church_id <> $1
      )
      insert into imani_archive_verification_report (
        source_table, church_id, source_rows, archived_rows,
        source_rows_missing_snapshot, archived_rows_not_currently_matching_source
      )
      select
        %2$L,
        ids.church_id,
        (select count(*) from public.%1$I src
         where (to_jsonb(src)->>'church_id')::uuid = ids.church_id),
        (select count(*) from imani_archive.row_snapshots a
         where a.source_table = %2$L and a.church_id = ids.church_id),
        (select count(*) from public.%1$I src
         where (to_jsonb(src)->>'church_id')::uuid = ids.church_id
           and not exists (
             select 1 from imani_archive.row_snapshots a
             where a.source_table = %2$L
               and a.church_id = ids.church_id
               and a.source_pk = jsonb_build_object(%3$s)
           )),
        (select count(*) from imani_archive.row_snapshots a
         where a.source_table = %2$L
           and a.church_id = ids.church_id
           and not exists (
             select 1 from public.%1$I src
             where (to_jsonb(src)->>'church_id')::uuid = ids.church_id
               and md5(to_jsonb(src)::text) = a.row_hash
           ))
      from church_ids ids
    $sql$, t.table_name, t.table_name, pk_expression);

    execute verify_sql using canonical_id;
  end loop;
end
$verify$;

select
  source_table,
  church_id,
  source_rows,
  archived_rows,
  source_rows_missing_snapshot,
  archived_rows_not_currently_matching_source,
  (source_rows_missing_snapshot = 0) as all_current_source_rows_snapshotted
from imani_archive_verification_report
order by source_table, church_id;

select
  count(*) as table_church_pairs_checked,
  count(*) filter (where source_rows_missing_snapshot = 0) as pairs_with_all_source_rows_snapshotted,
  count(*) filter (where source_rows_missing_snapshot > 0) as pairs_with_missing_snapshots,
  count(*) filter (where archived_rows_not_currently_matching_source > 0) as pairs_with_archived_rows_not_matching_current_source
from imani_archive_verification_report;

-- Important:
-- * "archived_rows_not_currently_matching_source" is informational, not proof of
--   loss: a row may have changed or been removed since the snapshot was taken.
-- * Missing snapshots are checked by source primary-key JSON, independently of
--   row content hashes. Hash mismatches are reported separately.
-- * This report is not a substitute for comparing against a frozen baseline,
--   foreign-key relationships, and a verified restorable backup.
-- * Do not delete operational rows based on this report alone.
