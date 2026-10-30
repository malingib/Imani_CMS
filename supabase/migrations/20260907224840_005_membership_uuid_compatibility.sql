-- The demo church uses a canonical all-zero UUID. The previous security
-- migration used an RFC 4122 version/variant regex, which incorrectly rejected
-- that valid PostgreSQL UUID. Keep validation canonical without requiring a UUID
-- version bit pattern.

CREATE OR REPLACE FUNCTION public.app_church_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN (auth.jwt() -> 'app_metadata' ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (auth.jwt() -> 'app_metadata' ->> 'church_id')::uuid
    ELSE NULL
  END
$$;

COMMENT ON FUNCTION public.app_church_id() IS
  'Returns only the server-controlled Supabase app_metadata church_id. Any canonical UUID is accepted, including legacy all-zero IDs.';

INSERT INTO public.church_memberships (user_id, church_id, role, status)
SELECT
  u.id,
  (u.raw_app_meta_data ->> 'church_id')::uuid,
  u.raw_app_meta_data ->> 'role',
  'active'
FROM auth.users u
WHERE (u.raw_app_meta_data ->> 'role') IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER')
  AND (u.raw_app_meta_data ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.churches c
    WHERE c.id = (u.raw_app_meta_data ->> 'church_id')::uuid
  )
ON CONFLICT (user_id, church_id) DO UPDATE
SET role = EXCLUDED.role,
    status = 'active',
    updated_at = now();
