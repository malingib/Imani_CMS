-- Security hardening: trust only server-controlled Supabase app_metadata for authorization.
-- user_metadata is user-editable and must never grant roles or tenant access.

CREATE OR REPLACE FUNCTION public.app_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    ''
  )
$$;

CREATE OR REPLACE FUNCTION public.app_church_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN (auth.jwt() -> 'app_metadata' ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN (auth.jwt() -> 'app_metadata' ->> 'church_id')::uuid
    ELSE NULL
  END
$$;

COMMENT ON FUNCTION public.app_role() IS
  'Returns only the server-controlled Supabase app_metadata role for the authenticated user. Never reads user_metadata.';

COMMENT ON FUNCTION public.app_church_id() IS
  'Returns only the server-controlled Supabase app_metadata church_id. Invalid or absent values resolve to NULL.';

-- Prevent unauthenticated callers from executing these helpers directly while
-- retaining authenticated access required by RLS evaluation.
REVOKE EXECUTE ON FUNCTION public.app_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.app_church_id() FROM anon;
GRANT EXECUTE ON FUNCTION public.app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_church_id() TO authenticated;
