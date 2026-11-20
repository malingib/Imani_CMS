-- STAFF is a limited workspace role: read-only calendar and group directory only.
ALTER POLICY church_events_role_select ON public.church_events
  TO authenticated
  USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']::text[])
  );

ALTER POLICY groups_role_select ON public.groups
  TO authenticated
  USING (
    public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']::text[])
  );
