-- Persist church-local preferences separately from platform-wide flags.
-- Church identity is stored on public.churches; changes go through a narrow RPC.
BEGIN;

-- Existing churches_updated_at trigger expects this column, but the live schema lacked it.
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.church_settings (
  church_id uuid PRIMARY KEY REFERENCES public.churches(id) ON DELETE CASCADE,
  notification_preferences jsonb NOT NULL DEFAULT '{
    "memberJoinsEmail": true,
    "memberJoinsSMS": false,
    "eventRemindersEmail": true,
    "eventRemindersSMS": true,
    "mpesaConfirmationsSMS": true,
    "mpesaConfirmationsEmail": true
  }'::jsonb CHECK (jsonb_typeof(notification_preferences) = 'object'),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.church_settings FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.church_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.church_settings TO service_role;

DROP POLICY IF EXISTS church_settings_select ON public.church_settings;
CREATE POLICY church_settings_select ON public.church_settings
  FOR SELECT TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR','SECRETARY']::text[]));

DROP POLICY IF EXISTS church_settings_insert ON public.church_settings;
CREATE POLICY church_settings_insert ON public.church_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[]));

DROP POLICY IF EXISTS church_settings_update ON public.church_settings;
CREATE POLICY church_settings_update ON public.church_settings
  FOR UPDATE TO authenticated
  USING (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[]))
  WITH CHECK (public.has_church_role(church_id, ARRAY['ADMIN','PASTOR']::text[]));

CREATE OR REPLACE FUNCTION public.touch_church_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_church_settings_updated_at ON public.church_settings;
CREATE TRIGGER touch_church_settings_updated_at
  BEFORE INSERT OR UPDATE ON public.church_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_church_settings();

CREATE OR REPLACE FUNCTION public.church_update_profile(
  p_church_id uuid,
  p_name text,
  p_address text,
  p_phone text,
  p_email text,
  p_website text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.has_church_role(p_church_id, ARRAY['ADMIN']::text[]) THEN
    RAISE EXCEPTION 'Only a church administrator can update the church profile';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(trim(p_name)) > 160 THEN
    RAISE EXCEPTION 'Enter a valid church name';
  END IF;
  IF length(coalesce(p_address, '')) > 500
    OR length(coalesce(p_phone, '')) > 40
    OR length(coalesce(p_email, '')) > 254
    OR length(coalesce(p_website, '')) > 255 THEN
    RAISE EXCEPTION 'One or more church profile fields are too long';
  END IF;

  UPDATE public.churches
  SET name = trim(p_name),
      address = nullif(trim(coalesce(p_address, '')), ''),
      phone = nullif(trim(coalesce(p_phone, '')), ''),
      email = nullif(trim(coalesce(p_email, '')), ''),
      website = nullif(trim(coalesce(p_website, '')), '')
  WHERE id = p_church_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Church not found';
  END IF;
  RETURN;
END;
$function$;

REVOKE ALL ON FUNCTION public.church_update_profile(uuid, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.church_update_profile(uuid, text, text, text, text, text) TO authenticated;

COMMIT;
