-- Cover the remaining live-advisor foreign-key lookup paths.
CREATE INDEX IF NOT EXISTS integration_provider_configs_secret_id_idx
  ON private.integration_provider_configs (secret_id);
CREATE INDEX IF NOT EXISTS integration_provider_configs_updated_by_idx
  ON private.integration_provider_configs (updated_by);
CREATE INDEX IF NOT EXISTS activities_member_id_idx
  ON public.activities (member_id);
CREATE INDEX IF NOT EXISTS church_settings_updated_by_idx
  ON public.church_settings (updated_by);
