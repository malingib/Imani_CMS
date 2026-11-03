import { handleCors, corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };
type Obj = Record<string, unknown>;

function reply(status: number, body: Obj) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
function normalizePhone(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (/^0[17]\d{8}$/.test(digits)) return '254' + digits.slice(1);
  if (/^[17]\d{8}$/.test(digits)) return '254' + digits;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error('Invalid Kenyan mobile number.');
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function authenticate(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: ANON_KEY, Authorization: authorization } });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user as Obj : null;
}
async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
      'Content-Type': 'application/json', ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}
async function rpc(name: string, body: Obj) {
  const { response, data } = await rest('rpc/' + name, { method: 'POST', body: JSON.stringify(body) });
  if (!response.ok) throw new Error('SMS configuration could not be loaded.');
  return data;
}
async function canSend(userId: string, churchId: string) {
  const query = new URLSearchParams({ select: 'role,status', user_id: 'eq.' + userId, church_id: 'eq.' + churchId, status: 'eq.active', limit: '1' });
  const { response, data } = await rest('church_memberships?' + query);
  return response.ok && Array.isArray(data) && ['ADMIN', 'PASTOR', 'SECRETARY'].includes(String(data[0]?.role || ''));
}
async function loadSmsConfig(churchId: string) {
  const read = async (scope: 'church' | 'platform') => {
    const result = await rpc('integration_config_get', { p_scope: scope, p_church_id: scope === 'church' ? churchId : null, p_provider: 'mobiwave' });
    const row = Array.isArray(result) ? result[0] : result;
    return row && typeof row === 'object' ? row as Obj : null;
  };
  let row = await read('church');
  if (!row?.secret || typeof row.secret !== 'object') row = await read('platform');
  if (!row?.secret || typeof row.secret !== 'object') return null;
  const settings = (row.settings || {}) as Obj;
  const secret = row.secret as Obj;
  const apiToken = String(secret.apiToken || '');
  const senderId = String(settings.senderId || '');
  if (!apiToken || !senderId) return null;
  return { apiToken, senderId };
}
async function dispatchStatus(churchId: string, key: string) {
  const { response, data } = await rest('sms_dispatches?select=id,status,message_hash,provider_message_id,result_description&church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(key));
  if (!response.ok) throw new Error('Could not check the SMS dispatch.');
  return Array.isArray(data) ? data[0] as Obj | undefined : undefined;
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return reply(500, { error: 'SMS service is not configured.' });

  const user = await authenticate(req.headers.get('Authorization'));
  if (!user) return reply(401, { error: 'Sign in to send SMS.' });

  let body: Obj;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 32768) return reply(413, { error: 'Request is too large.' });
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return reply(400, { error: 'Invalid request body.' });
  }

  const churchId = String(body.church_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(churchId)) return reply(400, { error: 'A valid church workspace is required.' });
  if (!await canSend(String(user.id), churchId)) return reply(403, { error: 'You do not have permission to send church SMS.' });

  const message = String(body.message || '').trim();
  if (!message || message.length > 1600) return reply(400, { error: 'Enter an SMS message between 1 and 1,600 characters.' });
  if (!Array.isArray(body.recipients) || body.recipients.length < 1 || body.recipients.length > 1000) {
    return reply(400, { error: 'Select between 1 and 1,000 recipients.' });
  }
  let recipients: string[];
  try { recipients = [...new Set(body.recipients.map(normalizePhone))]; }
  catch (error) { return reply(400, { error: error instanceof Error ? error.message : 'Invalid recipient number.' }); }
  if (!recipients.length) return reply(400, { error: 'No valid recipients were supplied.' });

  const idempotencyKey = String(req.headers.get('Idempotency-Key') || body.idempotency_key || '');
  if (idempotencyKey.length < 8 || idempotencyKey.length > 128) return reply(400, { error: 'A valid Idempotency-Key is required.' });

  const config = await loadSmsConfig(churchId).catch(() => null);
  if (!config) return reply(503, { error: 'MobiWave SMS is not configured for this church or the platform.' });
  const payloadHash = await sha256(JSON.stringify({ recipients, message, senderId: config.senderId }));

  const existing = await dispatchStatus(churchId, idempotencyKey).catch(() => undefined);
  if (existing) {
    if (String(existing.message_hash) !== payloadHash) return reply(409, { error: 'This Idempotency-Key was already used with a different message.' });
    if (existing.status === 'sent') return reply(200, { success: true, status: 'sent', sent: recipients.length, provider_message_id: existing.provider_message_id || null, message: 'This SMS dispatch was already accepted by MobiWave.' });
    if (existing.status === 'verification_required' || existing.status === 'initiating') {
      return reply(202, { success: false, status: existing.status, error: existing.result_description || 'The provider outcome is not yet known. Check MobiWave delivery reports before retrying.' });
    }
    return reply(502, { success: false, status: 'failed', error: existing.result_description || 'The previous dispatch failed. Create a new dispatch only after reviewing its outcome.' });
  }

  const { response: insertResponse } = await rest('sms_dispatches', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      church_id: churchId, created_by: user.id, idempotency_key: idempotencyKey,
      message_hash: payloadHash, recipient_count: recipients.length, status: 'initiating',
    }),
  });
  if (!insertResponse.ok) {
    const raced = await dispatchStatus(churchId, idempotencyKey).catch(() => undefined);
    if (raced && String(raced.message_hash) === payloadHash) {
      return reply(202, { success: false, status: raced.status, error: raced.result_description || 'This SMS dispatch is already being processed.' });
    }
    return reply(500, { error: 'Could not reserve the SMS dispatch. No message was sent.' });
  }

  try {
    const response = await fetch('https://sms.mobiwave.co.ke/api/v3/sms/send', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + config.apiToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        recipient: recipients.join(','),
        sender_id: config.senderId,
        type: 'plain',
        message,
      }),
      signal: AbortSignal.timeout(30000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 'success') {
      const description = String(result.message || 'MobiWave did not accept the SMS dispatch.').slice(0, 500);
      await rest('sms_dispatches?church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey), {
        method: 'PATCH', body: JSON.stringify({ status: 'failed', result_description: description }),
      });
      return reply(502, { success: false, status: 'failed', error: description });
    }

    const providerMessageId = String(result.data?.id || '');
    if (!providerMessageId) {
      const description = 'MobiWave accepted the request but returned no message reference. Verify the dispatch in the MobiWave dashboard before retrying.';
      await rest('sms_dispatches?church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey), {
        method: 'PATCH', body: JSON.stringify({ status: 'verification_required', result_description: description }),
      });
      return reply(502, { success: false, status: 'verification_required', error: description });
    }
    await rest('sms_dispatches?church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey), {
      method: 'PATCH', body: JSON.stringify({
        status: 'sent', provider_message_id: providerMessageId,
        result_description: 'Accepted by MobiWave SMS API.',
      }),
    });
    return reply(200, {
      success: true, status: 'sent', sent: recipients.length,
      provider_message_id: providerMessageId,
      message: 'MobiWave accepted the SMS dispatch. Delivery reports are separate from API acceptance.',
    });
  } catch (error) {
    const description = 'The provider response was uncertain. Check MobiWave delivery reports before retrying.';
    await rest('sms_dispatches?church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey), {
      method: 'PATCH', body: JSON.stringify({ status: 'verification_required', result_description: description }),
    });
    console.error('MobiWave SMS dispatch uncertain', error instanceof Error ? error.message : 'unknown');
    return reply(502, { success: false, status: 'verification_required', error: description });
  }
});
