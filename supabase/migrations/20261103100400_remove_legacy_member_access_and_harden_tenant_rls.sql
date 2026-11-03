-- Remove the legacy fixed-tenant permissive policy from every public table.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_policies
    WHERE schemaname = 'public' AND policyname = 'imani_canonical_church_guard'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'imani_canonical_church_guard', r.tablename);
  END LOOP;
END $$;

-- No application table policy should target PUBLIC/anon.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND roles @> ARRAY['public']::name[]
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER POLICY activities_role_select ON public.activities TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY audit_logs_role_insert ON public.audit_logs TO authenticated
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']) AND user_id = auth.uid());
ALTER POLICY church_events_role_select ON public.church_events TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY church_memberships_select_own ON public.church_memberships TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN']));
ALTER POLICY churches_tenant_read ON public.churches TO authenticated
  USING (has_church_role(id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']));
ALTER POLICY event_attendance_role_delete ON public.event_attendance TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY event_attendance_role_insert ON public.event_attendance TO authenticated
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY event_attendance_role_select ON public.event_attendance TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY financial_audit_insert ON public.financial_audit_log TO authenticated
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','TREASURER']) AND actor_id = auth.uid());
ALTER POLICY group_members_role_select ON public.group_members TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY groups_role_select ON public.groups TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY household_members_manage ON public.household_members TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY households_manage ON public.households TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_attendance_notes_manage ON public.member_attendance_notes TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_change_log_manager_insert ON public.member_change_log TO authenticated
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_change_log_manager_read ON public.member_change_log TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_follow_ups_manage ON public.member_follow_ups TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_status_history_insert ON public.member_status_history TO authenticated
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY member_status_history_manager_read ON public.member_status_history TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY members_role_select ON public.members TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY members_role_update ON public.members TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY notifications_role_delete ON public.notifications TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN']));
ALTER POLICY notifications_role_select ON public.notifications TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY notifications_role_update ON public.notifications TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']));
ALTER POLICY projects_manage ON public.church_projects TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']))
  WITH CHECK (has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']));
ALTER POLICY projects_select ON public.church_projects TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']));
ALTER POLICY sermons_role_select ON public.sermons TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']));
ALTER POLICY transactions_role_select ON public.transactions TO authenticated
  USING (has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER']));

CREATE OR REPLACE FUNCTION public.admin_create_church_invitation(
  p_church_id uuid, p_email text, p_role text, p_expires_days integer DEFAULT 7
)
RETURNS public.invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_role TEXT := upper(trim(p_role));
  v_email TEXT := lower(trim(p_email));
  v_inv public.invitations;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF app_role() <> 'SUPER_ADMIN' AND NOT EXISTS (
    SELECT 1 FROM public.church_memberships cm
    WHERE cm.user_id = auth.uid() AND cm.church_id = p_church_id
      AND cm.role = 'ADMIN' AND cm.status = 'active'
  ) THEN RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can create invitations'; END IF;
  IF v_role NOT IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF')
    THEN RAISE EXCEPTION 'Invalid church staff role'; END IF;
  IF v_email = '' OR position('@' IN v_email) < 2
    THEN RAISE EXCEPTION 'A valid email is required'; END IF;
  IF p_expires_days < 1 OR p_expires_days > 30
    THEN RAISE EXCEPTION 'Invitation expiry must be between 1 and 30 days'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.churches WHERE id = p_church_id)
    THEN RAISE EXCEPTION 'Church not found'; END IF;
  UPDATE public.invitations
  SET expires_at = now(), updated_at = now()
  WHERE church_id = p_church_id AND lower(email) = v_email
    AND accepted_at IS NULL AND expires_at > now();
  INSERT INTO public.invitations (church_id, email, role, token, expires_at)
  VALUES (p_church_id, v_email, v_role, encode(gen_random_bytes(32), 'hex'),
          now() + make_interval(days => p_expires_days))
  RETURNING * INTO v_inv;
  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (auth.uid(), 'INVITATION_CREATED', 'Membership Administration', now(), 'INFO',
          jsonb_build_object('invitation_id', v_inv.id, 'email', v_email, 'role', v_role), p_church_id);
  RETURN v_inv;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_membership_role(
  p_membership_id uuid, p_role text
)
RETURNS public.church_memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_membership public.church_memberships;
  v_role TEXT := upper(trim(p_role));
  v_admin_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_role NOT IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF')
    THEN RAISE EXCEPTION 'Invalid church staff role'; END IF;
  SELECT * INTO v_membership FROM public.church_memberships
  WHERE id = p_membership_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Membership not found'; END IF;
  IF app_role() <> 'SUPER_ADMIN' AND NOT EXISTS (
    SELECT 1 FROM public.church_memberships cm
    WHERE cm.user_id = auth.uid() AND cm.church_id = v_membership.church_id
      AND cm.role = 'ADMIN' AND cm.status = 'active'
  ) THEN RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can change membership roles'; END IF;
  IF v_membership.role = 'ADMIN' AND v_role <> 'ADMIN' AND v_membership.status = 'active' THEN
    SELECT count(*) INTO v_admin_count FROM public.church_memberships
    WHERE church_id = v_membership.church_id AND role = 'ADMIN' AND status = 'active';
    IF v_admin_count <= 1 THEN RAISE EXCEPTION 'A church must retain at least one active ADMIN'; END IF;
  END IF;
  UPDATE public.church_memberships SET role = v_role, updated_at = now()
  WHERE id = p_membership_id RETURNING * INTO v_membership;
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
