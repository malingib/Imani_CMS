-- Authoritative church membership model.
-- Memberships are server-provisioned and are intentionally not client-writable.
-- Supabase app_metadata remains the transitional JWT source for existing RLS until
-- application provisioning is migrated to these records.

CREATE TABLE IF NOT EXISTS public.church_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, church_id)
);

CREATE INDEX IF NOT EXISTS church_memberships_user_id_idx
  ON public.church_memberships (user_id);

CREATE INDEX IF NOT EXISTS church_memberships_church_id_idx
  ON public.church_memberships (church_id);

CREATE INDEX IF NOT EXISTS church_memberships_active_lookup_idx
  ON public.church_memberships (user_id, church_id, status);

ALTER TABLE public.church_memberships ENABLE ROW LEVEL SECURITY;

-- Memberships are read-only to the browser for now. Provisioning and role changes
-- will be performed by trusted server-side workflows/RPCs. This prevents a client
-- from granting itself ADMIN or attaching itself to another church.
DROP POLICY IF EXISTS church_memberships_select_own ON public.church_memberships;
CREATE POLICY church_memberships_select_own
  ON public.church_memberships
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR app_role() = 'SUPER_ADMIN'
    OR (app_role() IN ('ADMIN', 'PASTOR', 'STAFF') AND church_id = app_church_id())
  );

DROP POLICY IF EXISTS church_memberships_no_client_insert ON public.church_memberships;
DROP POLICY IF EXISTS church_memberships_no_client_update ON public.church_memberships;
DROP POLICY IF EXISTS church_memberships_no_client_delete ON public.church_memberships;

-- Security-definer helpers bypass membership RLS and are safe for use by future
-- tenant policies. search_path is locked to trusted schemas.
CREATE OR REPLACE FUNCTION public.is_church_member(target_church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.church_memberships cm
    WHERE cm.user_id = auth.uid()
      AND cm.church_id = target_church_id
      AND cm.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.church_membership_role(target_church_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT cm.role
  FROM public.church_memberships cm
  WHERE cm.user_id = auth.uid()
    AND cm.church_id = target_church_id
    AND cm.status = 'active'
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.is_church_member(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.church_membership_role(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_church_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.church_membership_role(UUID) TO authenticated;

COMMENT ON TABLE public.church_memberships IS
  'Server-provisioned authoritative relationship between an authenticated user and a church. Roles here never include SUPER_ADMIN.';
COMMENT ON FUNCTION public.is_church_member(UUID) IS
  'Returns true when the authenticated user has an active membership in the target church.';
COMMENT ON FUNCTION public.church_membership_role(UUID) IS
  'Returns the authenticated user''s active role in the target church.';

-- Backfill the existing trusted app_metadata assignments so the new model starts
-- complete without changing current access behavior.
INSERT INTO public.church_memberships (user_id, church_id, role, status)
SELECT
  u.id,
  (u.raw_app_meta_data ->> 'church_id')::uuid,
  u.raw_app_meta_data ->> 'role',
  'active'
FROM auth.users u
WHERE (u.raw_app_meta_data ->> 'role') IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER')
  AND (u.raw_app_meta_data ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1
    FROM public.churches c
    WHERE c.id = (u.raw_app_meta_data ->> 'church_id')::uuid
  )
ON CONFLICT (user_id, church_id) DO UPDATE
SET role = EXCLUDED.role,
    status = 'active',
    updated_at = now();
