
create or replace function public.is_church_member(target_church_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select exists (
    select 1
    from public.church_memberships cm
    join public.churches c on c.id = cm.church_id
    where cm.user_id = auth.uid()
      and cm.church_id = target_church_id
      and cm.status = 'active'
      and c.status = 'active'
  )
$function$;

create or replace function public.church_membership_role(target_church_id uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select cm.role
  from public.church_memberships cm
  join public.churches c on c.id = cm.church_id
  where cm.user_id = auth.uid()
    and cm.church_id = target_church_id
    and cm.status = 'active'
    and c.status = 'active'
  limit 1
$function$;

create or replace function public.app_church_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select c.id
  from public.churches c
  where c.id = case
    when (auth.jwt() -> 'app_metadata' ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (auth.jwt() -> 'app_metadata' ->> 'church_id')::uuid
    else null
  end
    and c.status = 'active'
  limit 1
$function$;

do $$
declare p record;
declare scope_column text;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public' and policyname = 'imani_canonical_church_guard'
  loop
    scope_column := case when p.tablename = 'churches' then 'id' else 'church_id' end;
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
    execute format(
      'create policy %I on public.%I for all using ((%I = %L::uuid) and (public.app_role() = ''SUPER_ADMIN'' or public.is_church_member(%I))) with check ((%I = %L::uuid) and (public.app_role() = ''SUPER_ADMIN'' or public.is_church_member(%I)))',
      p.policyname, p.tablename, scope_column, '00000000-0000-0000-0000-000000000001', scope_column,
      scope_column, '00000000-0000-0000-0000-000000000001', scope_column
    );
  end loop;
end $$;
