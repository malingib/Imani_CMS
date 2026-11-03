import { handleCors, corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const HEADERS = { 'Content-Type': 'application/json', ...corsHeaders };
type Obj = Record<string, unknown>;

function reply(status: number, body: Obj) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
function nairobiTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (key: string) => parts.find(part => part.type === key)?.value ?? '';
  return get('year') + get('month') + get('day') + get('hour') + get('minute') + get('second');
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
  if (!response.ok) throw new Error('Payment configuration could not be read.');
  return data;
}
async function canReconcile(userId: string, churchId: string) {
  const query = new URLSearchParams({ select: 'role,status', user_id: 'eq.' + userId, church_id: 'eq.' + churchId, status: 'eq.active', limit: '1' });
  const { response, data } = await rest('church_memberships?' + query);
  return response.ok && Array.isArray(data) && ['ADMIN', 'TREASURER'].includes(String(data[0]?.role || ''));
}
async function loadDarajaConfig(churchId: string) {
  const read = async (scope: 'church' | 'platform') => {
    const result = await rpc('integration_config_get', { p_scope: scope, p_church_id: scope === 'church' ? churchId : null, p_provider: 'mpesa' });
    const row = Array.isArray(result) ? result[0] : result;
    return row && typeof row === 'object' ? row as Obj : null;
  };
  let row = await read('church');
  if (!row?.secret || typeof row.secret !== 'object') row = await read('platform');
  if (!row?.secret || typeof row.secret !== 'object') return null;
  const settings = (row.settings || {}) as Obj;
  const secret = row.secret as Obj;
  const environment = settings.environment === 'production' ? 'production' : 'sandbox';
  const shortcode = String(settings.shortcode || '');
  const consumerKey = String(secret.consumerKey || '');
  const consumerSecret = String(secret.consumerSecret || '');
  const passkey = String(secret.passkey || '');
  if (!shortcode || !consumerKey || !consumerSecret || !passkey) return null;
  return { environment, shortcode, consumerKey, consumerSecret, passkey };
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return reply(500, { error: 'Payment service is not configured.' });
  const user = await authenticate(req.headers.get('Authorization'));
  if (!user) return reply(401, { error: 'Sign in to reconcile payments.' });

  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: 'Invalid request body.' }); }
  const paymentId = String(body.payment_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return reply(400, { error: 'A valid payment ID is required.' });

  const { response, data } = await rest('mpesa_payment_intents?select=id,church_id,status,checkout_request_id,mpesa_receipt_number&id=eq.' + encodeURIComponent(paymentId));
  if (!response.ok) return reply(502, { error: 'Could not load the payment request.' });
  const intent = Array.isArray(data) ? data[0] as Obj | undefined : undefined;
  if (!intent) return reply(404, { error: 'Payment request not found.' });
  if (!await canReconcile(String(user.id), String(intent.church_id))) {
    return reply(403, { error: 'Only church administrators and treasurers can reconcile payments.' });
  }
  if (intent.status === 'succeeded' || intent.status === 'failed') {
    return reply(200, { status: intent.status, receipt_number: intent.mpesa_receipt_number || null, message: 'This payment already has a final status.' });
  }
  if (!intent.checkout_request_id) {
    return reply(409, { status: intent.status, error: 'Safaricom has not returned a CheckoutRequestID. Do not create another request until this one is reviewed.' });
  }

  const config = await loadDarajaConfig(String(intent.church_id)).catch(() => null);
  if (!config) return reply(503, { error: 'M-Pesa credentials are not configured for this church or the platform.' });
  const host = config.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

  try {
    const tokenResponse = await fetch(host + '/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: 'Basic ' + btoa(config.consumerKey + ':' + config.consumerSecret), Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    const tokenBody = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || typeof tokenBody.access_token !== 'string') throw new Error('Safaricom authentication failed.');
    const timestamp = nairobiTimestamp();
    const password = btoa(config.shortcode + config.passkey + timestamp);
    const queryResponse = await fetch(host + '/mpesa/stkpushquery/v1/query', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tokenBody.access_token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: intent.checkout_request_id,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await queryResponse.json().catch(() => ({}));
    if (!queryResponse.ok || String(result.ResponseCode) !== '0') {
      return reply(502, { status: intent.status, error: String(result.errorMessage || result.ResponseDescription || 'Safaricom could not complete the status query.') });
    }

    const resultCode = result.ResultCode === undefined ? null : Number(result.ResultCode);
    let status = String(intent.status);
    let message = String(result.ResultDesc || result.ResponseDescription || 'Safaricom accepted the status query.');
    if (resultCode === 0) {
      // STK query does not provide the receipt metadata required for safe ledger posting.
      // Keep the payment out of the ledger until the signed-by-token callback supplies it.
      status = 'verification_required';
      message = 'Safaricom reports the STK request was processed. The receipt callback is still required before posting to the finance ledger.';
    } else if (resultCode === 1032) {
      status = 'failed';
      message = 'The payer cancelled the M-Pesa request.';
    }
    await rest('mpesa_payment_intents?id=eq.' + encodeURIComponent(paymentId), {
      method: 'PATCH',
      body: JSON.stringify({ status, result_code: resultCode, result_description: message }),
    });
    return reply(200, { status, message, receipt_number: intent.mpesa_receipt_number || null });
  } catch (error) {
    console.error('M-Pesa reconciliation query failed', error instanceof Error ? error.message : 'unknown');
    return reply(502, { status: intent.status, error: 'Safaricom status could not be checked. Retry the reconciliation request.' });
  }
});
