-- Enforce a distributed per-user Gemini request limit.
create table if not exists public.gemini_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.gemini_rate_limits enable row level security;
revoke all on table public.gemini_rate_limits from public, anon, authenticated;
grant all on table public.gemini_rate_limits to service_role;

create or replace function public.consume_gemini_rate_limit(
  p_user_id uuid,
  p_limit integer default 20,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_count integer;
begin
  if p_user_id is null or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.gemini_rate_limits (user_id, window_started_at, request_count, updated_at)
  values (p_user_id, pg_catalog.now(), 1, pg_catalog.now())
  on conflict (user_id) do update
    set window_started_at = case
          when public.gemini_rate_limits.window_started_at <= pg_catalog.now() - make_interval(secs => p_window_seconds)
            then pg_catalog.now()
          else public.gemini_rate_limits.window_started_at
        end,
        request_count = case
          when public.gemini_rate_limits.window_started_at <= pg_catalog.now() - make_interval(secs => p_window_seconds)
            then 1
          else public.gemini_rate_limits.request_count + 1
        end,
        updated_at = pg_catalog.now()
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$function$;

revoke all on function public.consume_gemini_rate_limit(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_gemini_rate_limit(uuid, integer, integer) to service_role;
