ALTER TABLE public.church_memberships
  DROP CONSTRAINT IF EXISTS church_memberships_role_check;

ALTER TABLE public.church_memberships
  ADD CONSTRAINT church_memberships_role_check
  CHECK (role = ANY (ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF']::text[]));
