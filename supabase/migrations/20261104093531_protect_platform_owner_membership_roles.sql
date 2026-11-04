CREATE OR REPLACE FUNCTION public.admin_set_membership_role(p_membership_id uuid, p_role text)
 RETURNS public.church_memberships
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_membership public.church_memberships;
  v_role TEXT := upper(trim(p_role));
  v_admin_count INTEGER;
  v_actor_role TEXT := '';
  v_target_role TEXT := '';
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COALESCE(u.raw_app_meta_data->>'role', '')
    INTO v_actor_role
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF v_role NOT IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF') THEN
    RAISE EXCEPTION 'Invalid church staff role';
  END IF;

  SELECT * INTO v_membership
  FROM public.church_memberships
  WHERE id = p_membership_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership not found';
  END IF;

  SELECT COALESCE(u.raw_app_meta_data->>'role', '')
    INTO v_target_role
  FROM auth.users u
  WHERE u.id = v_membership.user_id;

  IF v_actor_role <> 'SUPER_ADMIN' AND v_target_role = 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Only a platform owner can change a platform owner membership';
  END IF;

  IF v_actor_role <> 'SUPER_ADMIN' AND NOT EXISTS (
    SELECT 1
    FROM public.church_memberships cm
    WHERE cm.user_id = auth.uid()
      AND cm.church_id = v_membership.church_id
      AND cm.role = 'ADMIN'
      AND cm.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can change membership roles';
  END IF;

  IF v_membership.role = 'ADMIN' AND v_role <> 'ADMIN' AND v_membership.status = 'active' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.church_memberships
    WHERE church_id = v_membership.church_id
      AND role = 'ADMIN'
      AND status = 'active';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'A church must retain at least one active ADMIN';
    END IF;
  END IF;

  UPDATE public.church_memberships
  SET role = v_role, updated_at = now()
  WHERE id = p_membership_id
  RETURNING * INTO v_membership;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', v_role, 'church_id', v_membership.church_id)
  WHERE id = v_membership.user_id;

  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (auth.uid(), 'MEMBERSHIP_ROLE_CHANGED', 'Membership Administration', now(), 'INFO',
          jsonb_build_object('membership_id', v_membership.id, 'role', v_role), v_membership.church_id);

  RETURN v_membership;
END;
$function$;
