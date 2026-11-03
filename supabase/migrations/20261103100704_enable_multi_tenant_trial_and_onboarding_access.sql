-- Support the platform-owner multi-tenant workspace and trial/onboarding client access.
ALTER POLICY church_memberships_select_own ON public.church_memberships TO authenticated
USING (
  has_church_role(church_id, ARRAY['ADMIN'])
  OR (
    user_id = auth.uid()
    AND has_church_role(church_id, ARRAY['ADMIN','PASTOR','TREASURER','SECRETARY','STAFF'])
  )
);

CREATE OR REPLACE FUNCTION public.app_church_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT c.id
  FROM public.churches c
  WHERE c.id = CASE
    WHEN (auth.jwt() -> 'app_metadata' ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (auth.jwt() -> 'app_metadata' ->> 'church_id')::uuid
    ELSE NULL
  END
    AND c.status IN ('active', 'trialing', 'onboarding')
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.church_membership_role(target_church_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT cm.role
  FROM public.church_memberships cm
  JOIN public.churches c ON c.id = cm.church_id
  WHERE cm.user_id = auth.uid()
    AND cm.church_id = target_church_id
    AND cm.status = 'active'
    AND c.status IN ('active', 'trialing', 'onboarding')
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.is_church_member(target_church_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.church_memberships cm
    JOIN public.churches c ON c.id = cm.church_id
    WHERE cm.user_id = auth.uid()
      AND cm.church_id = target_church_id
      AND cm.status = 'active'
      AND c.status IN ('active', 'trialing', 'onboarding')
  )
$function$;

CREATE OR REPLACE FUNCTION public.has_church_role(target_church_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'pg_catalog'
AS $function$
  SELECT CASE
    WHEN public.app_role() = 'SUPER_ADMIN' THEN TRUE
    WHEN NOT (public.app_role() = ANY (allowed_roles)) THEN FALSE
    ELSE COALESCE(public.church_membership_role(target_church_id) = public.app_role(), FALSE)
  END
$function$;
