import { handleCors, corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };
type Obj = Record<string, unknown>;

function reply(status: number, body: Obj) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
async function authenticate(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: ANON_KEY, Authorization: authorization } });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user as Obj : null;
}
async function rest(path: string) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SERVICE_ROLE_KEY },
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}
async function rpc(name: string, body: Obj) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SERVICE_ROLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error('MobiWave SMS configuration could not be loaded.');
  return data;
}
async function canRead(userId: string, churchId: string) {
  const query = new URLSearchParams({ select: 'role,status', user_id: 'eq.' + userId, church_id: 'eq.' + churchId, status: 'eq.active', limit: '1' });
  const { response, data } = await rest('church_memberships?' + query);
  return response.ok && Array.isArray(data) && ['ADMIN', 'PASTOR', 'SECRETARY'].includes(String(data[0]?.role || ''));
}
async function loadSmsToken(churchId: string) {
  const read = async (scope: 'church' | 'platform') => {
    const result = await rpc('integration_config_get', { p_scope: scope, p_church_id: scope === 'church' ? churchId : null, p_provider: 'mobiwave' });
    const row = Array.isArray(result) ? result[0] : result;
    return row && typeof row === 'object' ? row as Obj : null;
  };
  let row = await read('church');
  if (!row?.secret || typeof row.secret !== 'object') row = await read('platform');
  const token = String((row?.secret as Obj | undefined)?.apiToken || '');
  return token || null;
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return reply(500, { error: 'SMS service is not configured.' });

  const user = await authenticate(req.headers.get('Authorization'));
  if (!user) return reply(401, { error: 'Sign in to view SMS delivery status.' });
  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: 'Invalid request body.' }); }

  const churchId = String(body.church_id || '');
  const messageId = String(body.message_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(churchId) || !messageId || messageId.length > 180) {
    return reply(400, { error: 'A valid church and provider message reference are required.' });
  }
  if (!await canRead(String(user.id), churchId)) return reply(403, { error: 'You do not have permission to view SMS delivery reports.' });

  const owned = await rest('sms_dispatches?select=id&church_id=eq.' + encodeURIComponent(churchId) + '&provider_message_id=eq.' + encodeURIComponent(messageId) + '&status=eq.sent');
  if (!owned.response.ok || !Array.isArray(owned.data) || !owned.data.length) return reply(404, { error: 'SMS dispatch not found in this church workspace.' });

  const apiToken = await loadSmsToken(churchId).catch(() => null);
  if (!apiToken) return reply(503, { error: 'MobiWave SMS credentials are not configured.' });

  try {
    const response = await fetch('https://sms.mobiwave.co.ke/api/v3/sms/' + encodeURIComponent(messageId), {
      headers: { Authorization: 'Bearer ' + apiToken, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 'success') {
      return reply(502, { error: String(result.message || 'MobiWave could not return a delivery report.') });
    }
    const data = result.data || {};
    return reply(200, {
      message_id: messageId,
      provider_status: String(data.status || 'unknown').toLowerCase(),
      delivered_at: data.delivered_at || null,
      submitted_at: data.sent_at || data.created_at || null,
    });
  } catch {
    return reply(502, { error: 'Could not reach MobiWave delivery reports. Retry the status check.' });
  }
});
