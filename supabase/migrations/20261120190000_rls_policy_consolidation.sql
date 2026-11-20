-- Remove the duplicate member status index reported by the live Database Advisor.
DROP INDEX IF EXISTS public.members_church_status_idx;

-- Consolidate overlapping permissive SELECT policies without changing role access.
DROP POLICY IF EXISTS churches_super_admin_all ON public.churches;
ALTER POLICY churches_tenant_read ON public.churches
  TO authenticated
  USING (
    public.app_role() = 'SUPER_ADMIN'
    OR (SELECT public.has_church_role(id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']::text[]))
  );
CREATE POLICY churches_super_admin_insert ON public.churches
  FOR INSERT TO authenticated
  WITH CHECK (public.app_role() = 'SUPER_ADMIN');
CREATE POLICY churches_super_admin_update ON public.churches
  FOR UPDATE TO authenticated
  USING (public.app_role() = 'SUPER_ADMIN')
  WITH CHECK (public.app_role() = 'SUPER_ADMIN');
CREATE POLICY churches_super_admin_delete ON public.churches
  FOR DELETE TO authenticated
  USING (public.app_role() = 'SUPER_ADMIN');

DROP POLICY IF EXISTS projects_manage ON public.church_projects;
CREATE POLICY projects_manage_insert ON public.church_projects
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']::text[])));
CREATE POLICY projects_manage_update ON public.church_projects
  FOR UPDATE TO authenticated
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']::text[])));
CREATE POLICY projects_manage_delete ON public.church_projects
  FOR DELETE TO authenticated
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','STAFF']::text[])));

DROP POLICY IF EXISTS funds_manage ON public.funds;
DROP POLICY IF EXISTS funds_pastor_read ON public.funds;
CREATE POLICY funds_select ON public.funds
  FOR SELECT TO authenticated
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER','PASTOR']::text[])));
CREATE POLICY funds_manage_insert ON public.funds
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::text[])));
CREATE POLICY funds_manage_update ON public.funds
  FOR UPDATE TO authenticated
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::text[])))
  WITH CHECK ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::text[])));
CREATE POLICY funds_manage_delete ON public.funds
  FOR DELETE TO authenticated
  USING ((SELECT public.has_church_role(church_id, ARRAY['ADMIN','TREASURER']::text[])));
