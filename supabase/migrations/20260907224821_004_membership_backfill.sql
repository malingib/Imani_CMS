-- Backfill users created after migration 003. This is intentionally idempotent.
INSERT INTO public.church_memberships (user_id, church_id, role, status)
SELECT
  u.id,
  (u.raw_app_meta_data ->> 'church_id')::uuid,
  u.raw_app_meta_data ->> 'role',
  'active'
FROM auth.users u
WHERE (u.raw_app_meta_data ->> 'role') IN ('ADMIN', 'PASTOR', 'STAFF', 'MEMBER')
  AND (u.raw_app_meta_data ->> 'church_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.churches c
    WHERE c.id = (u.raw_app_meta_data ->> 'church_id')::uuid
  )
ON CONFLICT (user_id, church_id) DO UPDATE
SET role = EXCLUDED.role,
    status = 'active',
    updated_at = now();
