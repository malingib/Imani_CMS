-- Fix the legacy UUID validation used by membership backfills and add secure
-- server-side administration primitives. Church admins may manage only church
-- memberships; SUPER_ADMIN remains platform-wide and is never a membership role.

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

-- Invitations must not be client-writable. Creation is exposed only through
-- the SECURITY DEFINER RPC below, which enforces the caller's church role.
DROP POLICY IF EXISTS invitations_tenant_access ON public.invitations;
CREATE POLICY invitations_tenant_select
  ON public.invitations
  FOR SELECT
  USING (
    app_role() = 'SUPER_ADMIN'
    OR is_church_member(church_id)
  );

CREATE OR REPLACE FUNCTION public.admin_create_church_invitation(
  p_church_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_expires_days INTEGER DEFAULT 7
)
RETURNS public.invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_role TEXT;
  v_email TEXT;
  v_inv public.invitations;
BEGIN
  v_email := lower(trim(p_email));
  v_role := upper(trim(p_role));

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF app_role() <> 'SUPER_ADMIN'
     AND NOT EXISTS (
       SELECT 1
       FROM public.church_memberships cm
       WHERE cm.user_id = auth.uid()
         AND cm.church_id = p_church_id
         AND cm.role = 'ADMIN'
         AND cm.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can create invitations';
  END IF;

  IF v_role NOT IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER') THEN
    RAISE EXCEPTION 'Invalid church role';
  END IF;

  IF v_email = '' OR position('@' IN v_email) < 2 THEN
    RAISE EXCEPTION 'A valid email is required';
  END IF;

  IF p_expires_days < 1 OR p_expires_days > 30 THEN
    RAISE EXCEPTION 'Invitation expiry must be between 1 and 30 days';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.churches WHERE id = p_church_id) THEN
    RAISE EXCEPTION 'Church not found';
  END IF;

  UPDATE public.invitations
  SET expires_at = now(), updated_at = now()
  WHERE church_id = p_church_id
    AND lower(email) = v_email
    AND accepted_at IS NULL
    AND expires_at > now();

  INSERT INTO public.invitations (
    church_id, email, role, token, expires_at
  )
  VALUES (
    p_church_id,
    v_email,
    v_role,
    encode(gen_random_bytes(32), 'hex'),
    now() + make_interval(days => p_expires_days)
  )
  RETURNING * INTO v_inv;

  INSERT INTO public.audit_logs (
    user_id, action, module, timestamp, severity, metadata, church_id
  )
  VALUES (
    auth.uid(),
    'INVITATION_CREATED',
    'Membership Administration',
    now(),
    'INFO',
    jsonb_build_object('invitation_id', v_inv.id, 'email', v_email, 'role', v_role),
    p_church_id
  );

  RETURN v_inv;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_membership_role(
  p_membership_id UUID,
  p_role TEXT
)
RETURNS public.church_memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_membership public.church_memberships;
  v_role TEXT := upper(trim(p_role));
  v_admin_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_role NOT IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER') THEN RAISE EXCEPTION 'Invalid church role'; END IF;

  SELECT * INTO v_membership
  FROM public.church_memberships
  WHERE id = p_membership_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Membership not found'; END IF;

  IF app_role() <> 'SUPER_ADMIN'
     AND NOT EXISTS (
       SELECT 1 FROM public.church_memberships cm
       WHERE cm.user_id = auth.uid() AND cm.church_id = v_membership.church_id
         AND cm.role = 'ADMIN' AND cm.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can change membership roles';
  END IF;

  IF v_membership.role = 'ADMIN' AND v_role <> 'ADMIN' AND v_membership.status = 'active' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.church_memberships
    WHERE church_id = v_membership.church_id AND role = 'ADMIN' AND status = 'active';
    IF v_admin_count <= 1 THEN RAISE EXCEPTION 'A church must retain at least one active ADMIN'; END IF;
  END IF;

  UPDATE public.church_memberships
  SET role = v_role, updated_at = now()
  WHERE id = p_membership_id
  RETURNING * INTO v_membership;

  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (auth.uid(), 'MEMBERSHIP_ROLE_CHANGED', 'Membership Administration', now(), 'INFO',
    jsonb_build_object('membership_id', v_membership.id, 'role', v_role), v_membership.church_id);

  RETURN v_membership;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_membership_status(
  p_membership_id UUID,
  p_status TEXT
)
RETURNS public.church_memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_membership public.church_memberships;
  v_status TEXT := lower(trim(p_status));
  v_admin_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_status NOT IN ('active', 'suspended') THEN RAISE EXCEPTION 'Invalid membership status'; END IF;

  SELECT * INTO v_membership
  FROM public.church_memberships
  WHERE id = p_membership_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Membership not found'; END IF;

  IF app_role() <> 'SUPER_ADMIN'
     AND NOT EXISTS (
       SELECT 1 FROM public.church_memberships cm
       WHERE cm.user_id = auth.uid() AND cm.church_id = v_membership.church_id
         AND cm.role = 'ADMIN' AND cm.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can change membership status';
  END IF;

  IF v_membership.role = 'ADMIN' AND v_membership.status = 'active' AND v_status = 'suspended' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.church_memberships
    WHERE church_id = v_membership.church_id AND role = 'ADMIN' AND status = 'active';
    IF v_admin_count <= 1 THEN RAISE EXCEPTION 'A church must retain at least one active ADMIN'; END IF;
  END IF;

  UPDATE public.church_memberships
  SET status = v_status, updated_at = now()
  WHERE id = p_membership_id
  RETURNING * INTO v_membership;

  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (auth.uid(), 'MEMBERSHIP_STATUS_CHANGED', 'Membership Administration', now(), 'INFO',
    jsonb_build_object('membership_id', v_membership.id, 'status', v_status), v_membership.church_id);

  RETURN v_membership;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_church_invitation(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_membership_role(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_membership_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_church_invitation(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_membership_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_membership_status(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_create_church_invitation(UUID, TEXT, TEXT, INTEGER) IS
  'Server-authorized church invitation creation. Only active church ADMINs and SUPER_ADMIN may call it.';
COMMENT ON FUNCTION public.admin_set_membership_role(UUID, TEXT) IS
  'Server-authorized church membership role change with last-admin protection.';
COMMENT ON FUNCTION public.admin_set_membership_status(UUID, TEXT) IS
  'Server-authorized membership suspension/reactivation with last-admin protection.';
