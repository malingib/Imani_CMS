import { supabase } from './supabase';

export type IntegrationProvider = 'daraja' | 'mobiwave_sms';
export type IntegrationScope = { scope: 'platform' } | { scope: 'church'; churchId: string };
export type IntegrationConfig = {
  provider: IntegrationProvider;
  scope: 'platform' | 'church';
  churchId?: string;
  enabled: boolean;
  configured: boolean;
  config: Record<string, string>;
  updatedAt?: string | null;
};

export async function getIntegrationConfig(provider: IntegrationProvider, target: IntegrationScope) {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) throw new Error('Please sign in again to manage integrations.');
  const params = new URLSearchParams({ provider, scope: target.scope });
  if (target.scope === 'church') params.set('churchId', target.churchId);
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-config?${params}`, {
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not load integration settings.');
  return result as IntegrationConfig;
}

export async function saveIntegrationConfig(
  provider: IntegrationProvider,
  target: IntegrationScope,
  payload: { enabled: boolean; config: Record<string, string>; secrets: Record<string, string> },
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) throw new Error('Please sign in again to manage integrations.');
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-config`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...target, ...payload }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not save integration settings.');
  return result as IntegrationConfig;
}