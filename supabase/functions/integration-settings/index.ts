import { handleCors, corsHeaders } from '../_shared/cors.ts';
import {
  validateMpesaSettings,
  validateMobiWaveSettings,
  validateProvider,
  validateProviderSecrets,
  validateScope,
} from '../_shared/integration-config.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? '';
const JSON_HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };

type JsonObject = Record<string, unknown>;

function respond(status: number, body: JsonObject) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function rpc(name: string, body: JsonObject) {
  const response = await fetch(`${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY!}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error('integration settings database operation failed', response.status);
    throw new Error('Integration settings could not be loaded or saved.');
  }
  return response.json();
}

async function authenticate(req: Request): Promise<JsonObject | null> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(`${SUPABASE_URL!.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authorization },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user : null;
}

async function authorize(user: JsonObject, scope: string, churchId: string | null, provider: string) {
  if (scope === 'platform') return churchId === null && (user.app_metadata as JsonObject | undefined)?.role === 'SUPER_ADMIN';
  if (scope !== 'church' || !churchId || !/^[0-9a-f-]{36}$/i.test(churchId)) return false;

  const query = new URLSearchParams({
    select: 'role',
    user_id: `eq.${user.id}`,
    church_id: `eq.${churchId}`,
    status: 'eq.active',
    limit: '1',
  });
  const response = await fetch(`${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/church_memberships?${query}`, {
    headers: { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (!response.ok) return false;
  const memberships = await response.json();
  const role = Array.isArray(memberships) ? memberships[0]?.role : null;
  const allowedRoles = provider === 'mpesa'
    ? ['ADMIN', 'TREASURER']
    : ['ADMIN', 'PASTOR', 'SECRETARY'];
  return allowedRoles.includes(role);
}

async function loadConfig(scope: string, churchId: string | null, provider: string) {
  const rows = await rpc('integration_config_get', {
    p_scope: scope,
    p_church_id: churchId,
    p_provider: provider,
  });
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

async function testConnection(provider: string, settings: JsonObject, secrets: JsonObject) {
  if (provider === 'mobiwave') {
    const apiToken = secrets.apiToken;
    if (typeof apiToken !== 'string' || !apiToken) return false;
    const response = await fetch('https://sms.mobiwave.co.ke/api/v3/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  }

  const consumerKey = secrets.consumerKey;
  const consumerSecret = secrets.consumerSecret;
  if (typeof consumerKey !== 'string' || typeof consumerSecret !== 'string') return false;
  const environment = settings.environment === 'production' ? 'production' : 'sandbox';
  const host = environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(`${host}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return false;
  const data = await response.json().catch(() => null);
  return typeof data?.access_token === 'string' && data.access_token.length > 0;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return respond(405, { error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return respond(500, { error: 'Integration service is not configured.' });

  const user = await authenticate(req);
  if (!user) return respond(401, { error: 'Sign in to manage integrations.' });

  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (declaredLength > 32_768) return respond(413, { error: 'Request is too large.' });
  let body: JsonObject;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 32_768) return respond(413, { error: 'Request is too large.' });
    body = JSON.parse(rawBody);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return respond(400, { error: 'Invalid request body.' });
  }

  const action = body.action;
  const scope = body.scope;
  const churchId = typeof body.churchId === 'string' ? body.churchId : null;
  const provider = body.provider;
  if (!validateScope(scope) || !validateProvider(provider) || !['get', 'save', 'test'].includes(String(action))) {
    return respond(400, { error: 'Invalid integration request.' });
  }
  if (!await authorize(user, scope, churchId, provider)) return respond(403, { error: 'You do not have permission to manage these integration settings.' });

  try {
    if (action === 'get') {
      const config = await loadConfig(scope, churchId, provider);
      const secrets = config?.secret && typeof config.secret === 'object' ? config.secret as JsonObject : null;
      return respond(200, {
        configured: !!config && !!secrets,
        settings: config?.settings ?? {},
        updatedAt: config?.updated_at ?? null,
      });
    }

    if (action === 'save') {
      const suppliedSettings = body.settings;
      const suppliedSecrets = body.credentials;
      const validSettings = provider === 'mpesa'
        ? validateMpesaSettings(suppliedSettings)
        : validateMobiWaveSettings(suppliedSettings);
      if (!validSettings) return respond(400, { error: 'Check the provider settings and try again.' });
      const settings = provider === 'mpesa'
        ? {
          environment: (suppliedSettings as Record<string, unknown>).environment,
          shortcode: (suppliedSettings as Record<string, unknown>).shortcode,
          transactionType: (suppliedSettings as Record<string, unknown>).transactionType,
          accountReference: (suppliedSettings as Record<string, unknown>).accountReference,
        }
        : { senderId: (suppliedSettings as Record<string, unknown>).senderId };

      const existing = await loadConfig(scope, churchId, provider);
      const existingSecrets = existing?.secret && typeof existing.secret === 'object' ? existing.secret as JsonObject : {};
      const credentials = { ...existingSecrets };
      if (suppliedSecrets && typeof suppliedSecrets === 'object' && !Array.isArray(suppliedSecrets)) {
        const allowedKeys = provider === 'mpesa'
          ? ['consumerKey', 'consumerSecret', 'passkey']
          : ['apiToken'];
        for (const key of allowedKeys) {
          const value = (suppliedSecrets as JsonObject)[key];
          if (typeof value === 'string' && value.trim()) credentials[key] = value.trim();
        }
      }
      if (!validateProviderSecrets(provider, credentials)) {
        return respond(400, { error: 'Enter the required provider credentials before saving.' });
      }

      await rpc('integration_config_save', {
        p_scope: scope,
        p_church_id: churchId,
        p_provider: provider,
        p_settings: settings,
        p_secret: credentials,
        p_updated_by: user.id,
      });
      return respond(200, { saved: true });
    }

    const config = await loadConfig(scope, churchId, provider);
    if (!config?.secret) return respond(400, { error: 'Save credentials before testing the connection.' });
    const connected = await testConnection(provider, config.settings ?? {}, config.secret as JsonObject);
    return respond(200, {
      connected,
      message: connected ? 'Provider credentials were accepted.' : 'The provider did not accept the configured credentials.',
    });
  } catch {
    return respond(502, { error: 'Integration provider could not be reached. Check the settings and try again.' });
  }
});
