-- Add indexes for advisor-identified foreign-key lookup paths.
CREATE INDEX IF NOT EXISTS expenses_created_by_idx ON public.expenses (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS financial_audit_log_actor_id_idx ON public.financial_audit_log (actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS households_primary_member_id_idx ON public.households (primary_member_id) WHERE primary_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS invoices_subscription_id_idx ON public.invoices (subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS member_attendance_notes_event_id_idx ON public.member_attendance_notes (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS member_attendance_notes_member_id_idx ON public.member_attendance_notes (member_id);
CREATE INDEX IF NOT EXISTS member_follow_ups_assigned_to_idx ON public.member_follow_ups (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS member_follow_ups_created_by_idx ON public.member_follow_ups (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS member_follow_ups_member_id_idx ON public.member_follow_ups (member_id);
CREATE INDEX IF NOT EXISTS member_status_history_changed_by_idx ON public.member_status_history (changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS member_status_history_member_id_idx ON public.member_status_history (member_id);
CREATE INDEX IF NOT EXISTS members_user_id_idx ON public.members (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS platform_releases_created_by_idx ON public.platform_releases (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS sermons_event_id_idx ON public.sermons (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_fund_id_idx ON public.transactions (fund_id) WHERE fund_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_member_id_idx ON public.transactions (member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_project_id_idx ON public.transactions (project_id) WHERE project_id IS NOT NULL;

-- Preserve policy semantics while allowing auth helpers to be evaluated once per statement.
ALTER POLICY audit_logs_role_insert ON public.audit_logs
  TO authenticated
  WITH CHECK (
    (SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']::text[]))
    AND user_id = (SELECT auth.uid())
  );

ALTER POLICY church_memberships_select_own ON public.church_memberships
  TO authenticated
  USING (
    (SELECT public.has_church_role(church_id, ARRAY['ADMIN']::text[]))
    OR (
      user_id = (SELECT auth.uid())
      AND (SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']::text[]))
    )
  );

ALTER POLICY financial_audit_insert ON public.financial_audit_log
  TO authenticated
  WITH CHECK (
    (SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::text[]))
    AND actor_id = (SELECT auth.uid())
  );
