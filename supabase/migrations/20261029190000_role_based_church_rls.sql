-- Replace membership-only CRUD access with the application role model.
-- Active church membership remains mandatory for every non-SUPER_ADMIN role.

BEGIN;

-- Keep the server-managed membership role vocabulary aligned with the roles
-- already exposed by the application. Existing rows remain unchanged.
ALTER TABLE public.church_memberships
  DROP CONSTRAINT IF EXISTS church_memberships_role_check;

ALTER TABLE public.church_memberships
  ADD CONSTRAINT church_memberships_role_check
  CHECK (role IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF', 'MEMBER'));

-- Provision legacy server-metadata roles that were omitted by the original
-- membership backfill. Existing membership status and role are preserved.
INSERT INTO public.church_memberships (user_id, church_id, role, status)
SELECT u.id, (u.raw_app_meta_data ->> 'church_id')::uuid,
       u.raw_app_meta_data ->> 'role', 'active'
FROM auth.users u
WHERE (u.raw_app_meta_data ->> 'role') IN ('TREASURER', 'SECRETARY')
  AND (u.raw_app_meta_data ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.churches c
    WHERE c.id = (u.raw_app_meta_data ->> 'church_id')::uuid
  )
ON CONFLICT (user_id, church_id) DO NOTHING;

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
  IF v_role NOT IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF', 'MEMBER')
    THEN RAISE EXCEPTION 'Invalid church role'; END IF;
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
  IF v_role NOT IN ('ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'STAFF', 'MEMBER')
    THEN RAISE EXCEPTION 'Invalid church role'; END IF;
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
  -- Keep the UI role claim synchronized for the next token refresh. RLS also
  -- checks the membership row, so a stale token cannot retain the old role.
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', v_role, 'church_id', v_membership.church_id)
  WHERE id = v_membership.user_id;
  INSERT INTO public.audit_logs (user_id, action, module, timestamp, severity, metadata, church_id)
  VALUES (auth.uid(), 'MEMBERSHIP_ROLE_CHANGED', 'Membership Administration', now(), 'INFO',
          jsonb_build_object('membership_id', v_membership.id, 'role', v_role), v_membership.church_id);
  RETURN v_membership;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_church_role(
  target_church_id UUID,
  allowed_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN public.app_role() = 'SUPER_ADMIN' THEN TRUE
    WHEN NOT (public.app_role() = ANY (allowed_roles)) THEN FALSE
    -- Both role and active state come from the server-managed membership row;
    -- a stale JWT cannot retain permissions after a role change or suspension.
    ELSE public.church_membership_role(target_church_id) = public.app_role()
  END
$$;

REVOKE ALL ON FUNCTION public.has_church_role(UUID, TEXT[]) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_church_role(UUID, TEXT[]) TO authenticated;

-- Member directory: members see their own linked profile; staff roles see the
-- directory. Self-service member edits remain limited to the linked row.
DROP POLICY IF EXISTS tenant_isolation_members ON public.members;

CREATE POLICY members_role_select ON public.members
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']::TEXT[])
    OR (public.app_role() = 'MEMBER' AND public.church_membership_role(church_id) = 'MEMBER' AND user_id = auth.uid())
  );

CREATE POLICY members_role_insert ON public.members
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

CREATE POLICY members_role_update ON public.members
  FOR UPDATE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (public.app_role() = 'MEMBER' AND public.church_membership_role(church_id) = 'MEMBER' AND user_id = auth.uid())
  ) WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (public.app_role() = 'MEMBER' AND public.church_membership_role(church_id) = 'MEMBER' AND user_id = auth.uid())
  );

CREATE POLICY members_role_delete ON public.members
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

-- Finance data: members can read only their own linked transactions. Finance
-- administration remains available to ADMIN, TREASURER, and SUPER_ADMIN.
DROP POLICY IF EXISTS tenant_isolation_transactions ON public.transactions;

CREATE POLICY transactions_role_select ON public.transactions
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER']::TEXT[])
    OR (
      public.app_role() = 'MEMBER'
      AND public.church_membership_role(church_id) = 'MEMBER'
      AND EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = transactions.member_id
          AND m.user_id = auth.uid()
          AND m.church_id = transactions.church_id
      )
    )
  );

CREATE POLICY transactions_role_insert ON public.transactions
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[])
  );

CREATE POLICY transactions_role_update ON public.transactions
  FOR UPDATE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[])
  ) WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[])
  );

CREATE POLICY transactions_role_delete ON public.transactions
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[])
  );

-- Events are visible to active members; management stays with church staff.
DROP POLICY IF EXISTS tenant_isolation_events ON public.church_events;

CREATE POLICY church_events_role_select ON public.church_events
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[])
  );

CREATE POLICY church_events_role_insert ON public.church_events
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

CREATE POLICY church_events_role_update ON public.church_events
  FOR UPDATE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  ) WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

CREATE POLICY church_events_role_delete ON public.church_events
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

-- Attendance is readable within the church for existing event counts. Members
-- may change only their own RSVP; staff may manage full attendance lists.
DROP POLICY IF EXISTS tenant_isolation_event_attendance ON public.event_attendance;

CREATE POLICY event_attendance_role_select ON public.event_attendance
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[])
  );

CREATE POLICY event_attendance_role_insert ON public.event_attendance
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (
      public.app_role() = 'MEMBER'
      AND public.church_membership_role(church_id) = 'MEMBER'
      AND EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_attendance.member_id
          AND m.user_id = auth.uid()
          AND m.church_id = event_attendance.church_id
      )
    )
  );

CREATE POLICY event_attendance_role_delete ON public.event_attendance
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (
      public.app_role() = 'MEMBER'
      AND public.church_membership_role(church_id) = 'MEMBER'
      AND EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_attendance.member_id
          AND m.user_id = auth.uid()
          AND m.church_id = event_attendance.church_id
      )
    )
  );

-- Groups are visible to church members; only the existing group-manager roles
-- can change groups or group membership.
DROP POLICY IF EXISTS tenant_isolation_groups ON public.groups;

CREATE POLICY groups_role_select ON public.groups
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[])
  );

CREATE POLICY groups_role_insert ON public.groups
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  );

CREATE POLICY groups_role_update ON public.groups
  FOR UPDATE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  ) WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  );

CREATE POLICY groups_role_delete ON public.groups
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  );

DROP POLICY IF EXISTS tenant_isolation_group_members ON public.group_members;

CREATE POLICY group_members_role_select ON public.group_members
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[])
  );

CREATE POLICY group_members_role_insert ON public.group_members
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  );

CREATE POLICY group_members_role_delete ON public.group_members
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[])
  );

-- Finance summaries stay readable by ADMIN, PASTOR, and TREASURER. Only ADMIN
-- and TREASURER can write budgets and recurring expenses.
DROP POLICY IF EXISTS tenant_isolation_budgets ON public.budgets;

CREATE POLICY budgets_role_select ON public.budgets
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER']::TEXT[]));

CREATE POLICY budgets_role_insert ON public.budgets
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

CREATE POLICY budgets_role_update ON public.budgets
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

CREATE POLICY budgets_role_delete ON public.budgets
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

DROP POLICY IF EXISTS tenant_isolation_recurring ON public.recurring_expenses;

CREATE POLICY recurring_expenses_role_select ON public.recurring_expenses
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER']::TEXT[]));

CREATE POLICY recurring_expenses_role_insert ON public.recurring_expenses
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

CREATE POLICY recurring_expenses_role_update ON public.recurring_expenses
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

CREATE POLICY recurring_expenses_role_delete ON public.recurring_expenses
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

-- Only communications managers can inspect or modify broadcast history.
DROP POLICY IF EXISTS tenant_isolation_communications ON public.communications;

CREATE POLICY communications_role_select ON public.communications
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[]));

CREATE POLICY communications_role_insert ON public.communications
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[]));

CREATE POLICY communications_role_update ON public.communications
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[]));

CREATE POLICY communications_role_delete ON public.communications
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

-- Members see their own notifications and activity. Managers retain the
-- existing church-wide support view.
DROP POLICY IF EXISTS tenant_isolation_notifications ON public.notifications;

CREATE POLICY notifications_role_select ON public.notifications
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (user_id = auth.uid() AND public.is_church_member(church_id))
  );

CREATE POLICY notifications_role_insert ON public.notifications
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
  );

CREATE POLICY notifications_role_update ON public.notifications
  FOR UPDATE USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (user_id = auth.uid() AND public.is_church_member(church_id))
  ) WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR (user_id = auth.uid() AND public.is_church_member(church_id))
  );

CREATE POLICY notifications_role_delete ON public.notifications
  FOR DELETE USING (
    public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[])
    OR (user_id = auth.uid() AND public.is_church_member(church_id))
  );

DROP POLICY IF EXISTS tenant_isolation_activities ON public.activities;

CREATE POLICY activities_role_select ON public.activities
  FOR SELECT USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::TEXT[])
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = activities.member_id
        AND m.user_id = auth.uid()
        AND m.church_id = activities.church_id
        AND public.church_membership_role(activities.church_id) = 'MEMBER'
    )
  );

-- Audit records are append-only for authenticated church users; only admins
-- can inspect the church-wide audit stream.
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON public.audit_logs;

CREATE POLICY audit_logs_role_select ON public.audit_logs
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY audit_logs_role_insert ON public.audit_logs
  FOR INSERT WITH CHECK (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[])
    AND user_id = auth.uid()
  );

-- Church membership invitations are private to church administrators. Writes
-- stay behind the existing SECURITY DEFINER administration functions.
DROP POLICY IF EXISTS invitations_tenant_access ON public.invitations;

DROP POLICY IF EXISTS invitations_tenant_select ON public.invitations;

CREATE POLICY invitations_role_select ON public.invitations
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

-- Billing records are restricted to church administrators and platform admins.
DROP POLICY IF EXISTS subscriptions_tenant_access ON public.subscriptions;

CREATE POLICY subscriptions_role_select ON public.subscriptions
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY subscriptions_role_insert ON public.subscriptions
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY subscriptions_role_update ON public.subscriptions
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY subscriptions_role_delete ON public.subscriptions
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

DROP POLICY IF EXISTS invoices_tenant_access ON public.invoices;

CREATE POLICY invoices_role_select ON public.invoices
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY invoices_role_insert ON public.invoices
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY invoices_role_update ON public.invoices
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

CREATE POLICY invoices_role_delete ON public.invoices
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN']::TEXT[]));

-- Sermons are readable by church members; only ADMIN and PASTOR can publish.
DROP POLICY IF EXISTS tenant_isolation_sermons ON public.sermons;

CREATE POLICY sermons_role_select ON public.sermons
  FOR SELECT USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','MEMBER']::TEXT[]));

CREATE POLICY sermons_role_insert ON public.sermons
  FOR INSERT WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[]));

CREATE POLICY sermons_role_update ON public.sermons
  FOR UPDATE USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[]));

CREATE POLICY sermons_role_delete ON public.sermons
  FOR DELETE USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::TEXT[]));

COMMIT;
