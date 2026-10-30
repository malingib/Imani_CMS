-- Secure church administration primitives.
-- Church ADMINs can update their own church profile and onboarding state;
-- SUPER_ADMIN may administer any church. Client writes remain RLS protected.

CREATE OR REPLACE FUNCTION public.admin_update_church_profile(
  p_church_id UUID,
  p_name TEXT,
  p_address TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL
)
RETURNS public.churches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_church public.churches;
  v_name TEXT := trim(COALESCE(p_name, ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF app_role() <> 'SUPER_ADMIN'
     AND NOT EXISTS (
       SELECT 1 FROM public.church_memberships cm
       WHERE cm.user_id = auth.uid()
         AND cm.church_id = p_church_id
         AND cm.role = 'ADMIN'
         AND cm.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can update church settings';
  END IF;

  IF v_name = '' THEN
    RAISE EXCEPTION 'Church name is required';
  END IF;

  IF length(v_name) > 200 THEN
    RAISE EXCEPTION 'Church name is too long';
  END IF;

  UPDATE public.churches
  SET name = v_name,
      address = NULLIF(trim(COALESCE(p_address, '')), ''),
      phone = NULLIF(trim(COALESCE(p_phone, '')), ''),
      email = NULLIF(lower(trim(COALESCE(p_email, ''))), ''),
      logo_url = NULLIF(trim(COALESCE(p_logo_url, '')), '')
  WHERE id = p_church_id
  RETURNING * INTO v_church;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Church not found';
  END IF;

  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (
    auth.uid(),
    'CHURCH_PROFILE_UPDATED',
    'Church Administration',
    now(),
    'INFO',
    jsonb_build_object('church_id', p_church_id),
    p_church_id
  );

  RETURN v_church;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_onboarding_step(
  p_church_id UUID,
  p_step TEXT
)
RETURNS public.churches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_church public.churches;
  v_step TEXT := lower(trim(COALESCE(p_step, '')));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF app_role() <> 'SUPER_ADMIN'
     AND NOT EXISTS (
       SELECT 1 FROM public.church_memberships cm
       WHERE cm.user_id = auth.uid()
         AND cm.church_id = p_church_id
         AND cm.role = 'ADMIN'
         AND cm.status = 'active'
     ) THEN
    RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can update onboarding';
  END IF;

  IF v_step NOT IN ('welcome', 'profile', 'team', 'preferences', 'complete') THEN
    RAISE EXCEPTION 'Invalid onboarding step';
  END IF;

  UPDATE public.churches
  SET onboarding_step = v_step
  WHERE id = p_church_id
  RETURNING * INTO v_church;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Church not found';
  END IF;

  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (
    auth.uid(),
    'CHURCH_ONBOARDING_UPDATED',
    'Church Administration',
    now(),
    'INFO',
    jsonb_build_object('step', v_step),
    p_church_id
  );

  RETURN v_church;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_church_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_onboarding_step(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_church_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_onboarding_step(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_update_church_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS
  'Server-authorized church profile update for active church ADMINs and SUPER_ADMIN.';
COMMENT ON FUNCTION public.admin_set_onboarding_step(UUID, TEXT) IS
  'Server-authorized church onboarding state update for active church ADMINs and SUPER_ADMIN.';
