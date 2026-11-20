-- STAFF is restricted to read-only Events and Groups access.
-- Remove STAFF from legacy member-management and project policies so direct API calls
-- cannot bypass the workspace UI role restrictions.

ALTER POLICY projects_manage_delete ON public.church_projects
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY projects_manage_insert ON public.church_projects
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY projects_manage_update ON public.church_projects
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY projects_select ON public.church_projects
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY']::text[])));

ALTER POLICY household_members_manage ON public.household_members
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY households_manage ON public.households
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_attendance_notes_manage ON public.member_attendance_notes
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_change_log_manager_insert ON public.member_change_log
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_change_log_manager_read ON public.member_change_log
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_follow_ups_manage ON public.member_follow_ups
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_status_history_insert ON public.member_status_history
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
ALTER POLICY member_status_history_manager_read ON public.member_status_history
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[])));
