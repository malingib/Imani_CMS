BEGIN;
ALTER VIEW public.member_attendance_summary SET (security_invoker = true);
REVOKE EXECUTE ON FUNCTION public.church_membership_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_church_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.church_membership_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_church_member(uuid) TO authenticated, service_role;
COMMIT;
