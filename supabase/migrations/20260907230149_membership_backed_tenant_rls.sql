-- Move tenant isolation from the transitional JWT church_id to the
-- server-provisioned church_memberships model.
-- SUPER_ADMIN remains platform-wide. All other access requires an active
-- membership in the target church.

-- Replace the existing tenant policies explicitly. Keeping the policy names
-- stable avoids duplicate policy paths and makes the migration idempotent.
DROP POLICY IF EXISTS tenant_isolation_members ON public.members;
CREATE POLICY tenant_isolation_members ON public.members
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_transactions ON public.transactions;
CREATE POLICY tenant_isolation_transactions ON public.transactions
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_events ON public.church_events;
CREATE POLICY tenant_isolation_events ON public.church_events
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_budgets ON public.budgets;
CREATE POLICY tenant_isolation_budgets ON public.budgets
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_recurring ON public.recurring_expenses;
CREATE POLICY tenant_isolation_recurring ON public.recurring_expenses
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_communications ON public.communications;
CREATE POLICY tenant_isolation_communications ON public.communications
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_notifications ON public.notifications;
CREATE POLICY tenant_isolation_notifications ON public.notifications
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_audit_logs ON public.audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON public.audit_logs
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_event_attendance ON public.event_attendance;
CREATE POLICY tenant_isolation_event_attendance ON public.event_attendance
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_group_members ON public.group_members;
CREATE POLICY tenant_isolation_group_members ON public.group_members
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_groups ON public.groups;
CREATE POLICY tenant_isolation_groups ON public.groups
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS invitations_tenant_access ON public.invitations;
CREATE POLICY invitations_tenant_access ON public.invitations
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS invoices_tenant_access ON public.invoices;
CREATE POLICY invoices_tenant_access ON public.invoices
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS tenant_isolation_sermons ON public.sermons;
CREATE POLICY tenant_isolation_sermons ON public.sermons
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

DROP POLICY IF EXISTS subscriptions_tenant_access ON public.subscriptions;
CREATE POLICY subscriptions_tenant_access ON public.subscriptions
  FOR ALL USING (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id))
  WITH CHECK (app_role() = 'SUPER_ADMIN' OR is_church_member(church_id));

-- Churches are visible to their active members. Platform administration retains
-- unrestricted access.
DROP POLICY IF EXISTS churches_tenant_read ON public.churches;
CREATE POLICY churches_tenant_read ON public.churches
  FOR SELECT USING (app_role() = 'SUPER_ADMIN' OR is_church_member(id));

COMMENT ON FUNCTION public.is_church_member(UUID) IS
  'Authoritative tenant check: authenticated user must have an active server-provisioned membership in the target church.';
