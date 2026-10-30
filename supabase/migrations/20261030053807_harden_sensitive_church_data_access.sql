BEGIN;

-- Remove legacy tenant-wide SELECT policies that OR around newer role rules.
DROP POLICY IF EXISTS expenses_select ON public.expenses;
DROP POLICY IF EXISTS expenses_manage ON public.expenses;
CREATE POLICY expenses_manage ON public.expenses
  FOR ALL TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

DROP POLICY IF EXISTS funds_select ON public.funds;
DROP POLICY IF EXISTS funds_manage ON public.funds;
CREATE POLICY funds_manage ON public.funds
  FOR ALL TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));
CREATE POLICY funds_pastor_read ON public.funds
  FOR SELECT TO authenticated
  USING (public.has_church_role(church_id, ARRAY['PASTOR']::TEXT[]));

DROP POLICY IF EXISTS household_members_select ON public.household_members;
DROP POLICY IF EXISTS households_select ON public.households;
DROP POLICY IF EXISTS member_attendance_notes_select ON public.member_attendance_notes;
DROP POLICY IF EXISTS member_follow_ups_select ON public.member_follow_ups;
DROP POLICY IF EXISTS member_status_history_select ON public.member_status_history;

CREATE POLICY member_status_history_manager_read ON public.member_status_history
  FOR SELECT TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']::TEXT[]));

DROP POLICY IF EXISTS financial_audit_select ON public.financial_audit_log;
CREATE POLICY financial_audit_select ON public.financial_audit_log
  FOR SELECT TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::TEXT[]));

COMMIT;
