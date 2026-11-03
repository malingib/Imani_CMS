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
  throw new Error('Enter a valid Kenyan M-Pesa phone number.');
}
function nairobiTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (key: string) => parts.find(part => part.type === key)?.value ?? '';
  return get('year') + get('month') + get('day') + get('hour') + get('minute') + get('second');
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function authenticate(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: ANON_KEY, Authorization: authorization },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user as Obj : null;
}
async function churchRoleAllowed(userId: string, churchId: string) {
  const query = new URLSearchParams({
    select: 'role,status', user_id: 'eq.' + userId, church_id: 'eq.' + churchId, status: 'eq.active', limit: '1',
  });
  const response = await fetch(SUPABASE_URL + '/rest/v1/church_memberships?' + query, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SERVICE_ROLE_KEY },
  });
  if (!response.ok) return false;
  const rows = await response.json();
  return Array.isArray(rows) && ['ADMIN', 'TREASURER'].includes(String(rows[0]?.role || ''));
}
async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}
async function rpc(name: string, payload: Obj) {
  const { response, data } = await rest('rpc/' + name, { method: 'POST', body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Payment database operation failed.');
  return data;
}
async function loadDarajaConfig(churchId: string) {
  const read = async (scope: 'church' | 'platform') => {
    const data = await rpc('integration_config_get', {
      p_scope: scope, p_church_id: scope === 'church' ? churchId : null, p_provider: 'mpesa',
    });
    const row = Array.isArray(data) ? data[0] : data;
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
  return {
    environment, shortcode, consumerKey, consumerSecret, passkey,
    transactionType: String(settings.transactionType || 'CustomerPayBillOnline'),
    accountReference: String(settings.accountReference || 'IMANI').slice(0, 20),
  };
}
async function darajaToken(config: { environment: string; consumerKey: string; consumerSecret: string }) {
  const host = config.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const response = await fetch(host + '/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: 'Basic ' + btoa(config.consumerKey + ':' + config.consumerSecret), Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== 'string') throw new Error('Safaricom authentication failed.');
  return { host, token: data.access_token as string };
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return reply(500, { error: 'Payment service is not configured.' });

  let body: Obj;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 16384) return reply(413, { error: 'Request is too large.' });
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
  } catch {
    return reply(400, { error: 'Invalid request body.' });
  }

  // Public Safaricom callback. A per-request high-entropy token is required in addition
  // to matching the server-created CheckoutRequestID.
  if (body.Body && typeof body.Body === 'object' && (body.Body as Obj).stkCallback) {
    const callback = (body.Body as Obj).stkCallback as Obj;
    const checkoutId = String(callback.CheckoutRequestID || '');
    const token = new URL(req.url).searchParams.get('token') || '';
    if (!checkoutId || token.length < 32) return reply(401, { error: 'Invalid callback credentials.' });
    const found = await rest('mpesa_payment_intents?select=id,callback_token_hash&checkout_request_id=eq.' + encodeURIComponent(checkoutId));
    const intent = Array.isArray(found.data) ? found.data[0] as Obj | undefined : undefined;
    if (!found.response.ok || !intent || await sha256(token) !== String(intent.callback_token_hash || '')) {
      return reply(401, { error: 'Callback could not be authenticated.' });
    }

    const items = Array.isArray((callback.CallbackMetadata as Obj | undefined)?.Item)
      ? (callback.CallbackMetadata as Obj).Item as Array<Obj> : [];
    const value = (name: string) => items.find(item => item.Name === name)?.Value;
    const resultCode = Number(callback.ResultCode);
    const amount = value('Amount');
    const receipt = value('MpesaReceiptNumber');
    const phone = value('PhoneNumber');
    try {
      await rpc('record_mpesa_stk_callback', {
        p_checkout_request_id: checkoutId,
        p_result_code: Number.isFinite(resultCode) ? resultCode : null,
        p_result_description: String(callback.ResultDesc || 'Safaricom callback received'),
        p_amount: amount === undefined ? null : Number(amount),
        p_receipt: receipt === undefined ? null : String(receipt),
        p_phone: phone === undefined ? null : String(phone),
        p_callback_payload: body,
      });
    } catch (error) {
      console.error('M-Pesa callback processing failed', error instanceof Error ? error.message : 'unknown');
      return reply(500, { ResultCode: 1, ResultDesc: 'Callback processing failed; retry delivery.' });
    }
    return reply(200, { ResultCode: 0, ResultDesc: 'Accepted.' });
  }

  const user = await authenticate(req.headers.get('Authorization'));
  if (!user) return reply(401, { error: 'Sign in to initiate a payment.' });

  const churchId = String(body.church_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(churchId)) return reply(400, { error: 'A valid church workspace is required.' });
  if (!await churchRoleAllowed(String(user.id), churchId)) {
    return reply(403, { error: 'Only church administrators and treasurers can initiate collections.' });
  }

  const amount = Number(body.amount);
  const purpose = String(body.purpose || '');
  if (!Number.isInteger(amount) || amount < 1 || amount > 250000 || !['Tithe', 'Offering', 'Project', 'Harambee', 'Benevolence'].includes(purpose)) {
    return reply(400, { error: 'Enter a valid whole-KES amount and payment purpose.' });
  }
  let phone: string;
  try { phone = normalizePhone(body.phone_number); }
  catch (error) { return reply(400, { error: error instanceof Error ? error.message : 'Invalid phone number.' }); }

  const idempotencyKey = String(req.headers.get('Idempotency-Key') || body.idempotency_key || '');
  if (idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return reply(400, { error: 'A valid Idempotency-Key is required.' });
  }

  const existing = await rest('mpesa_payment_intents?select=id,status,mpesa_receipt_number,result_description&church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey));
  if (!existing.response.ok) return reply(500, { error: 'Could not check the payment request.' });
  if (Array.isArray(existing.data) && existing.data[0]) {
    const row = existing.data[0] as Obj;
    return reply(200, {
      payment_id: row.id, status: row.status, receipt_number: row.mpesa_receipt_number || null,
      customer_message: row.result_description || 'This payment request already exists. Check its current status.',
    });
  }

  const config = await loadDarajaConfig(churchId).catch(() => null);
  if (!config) return reply(503, { error: 'M-Pesa is not configured for this church or the platform.' });

  const callbackToken = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(byte => byte.toString(16).padStart(2, '0')).join('');
  const callbackTokenHash = await sha256(callbackToken);
  const accountReference = config.accountReference || 'IMANI';
  const payerName = String(body.payer_name || '').trim().slice(0, 100) || null;
  const { response: insertResponse, data: inserted } = await rest('mpesa_payment_intents', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      church_id: churchId, created_by: user.id, payer_name: payerName, phone_number: phone,
      amount, purpose, account_reference: accountReference,
      idempotency_key: idempotencyKey, callback_token_hash: callbackTokenHash, status: 'initiating',
    }),
  });
  if (!insertResponse.ok || !Array.isArray(inserted) || !inserted[0]) {
    // Concurrent retries can race on the church/idempotency unique key. Return the
    // already-created intent rather than submitting a second STK request.
    const retry = await rest('mpesa_payment_intents?select=id,status,mpesa_receipt_number,result_description&church_id=eq.' + encodeURIComponent(churchId) + '&idempotency_key=eq.' + encodeURIComponent(idempotencyKey));
    if (Array.isArray(retry.data) && retry.data[0]) {
      const row = retry.data[0] as Obj;
      return reply(200, { payment_id: row.id, status: row.status, receipt_number: row.mpesa_receipt_number || null, customer_message: row.result_description || 'Payment request already exists.' });
    }
    return reply(500, { error: 'Could not create the payment request.' });
  }
  const intent = inserted[0] as Obj;

  try {
    const { host, token } = await darajaToken(config);
    const timestamp = nairobiTimestamp();
    const password = btoa(config.shortcode + config.passkey + timestamp);
    const callbackUrl = SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/mpesa-stk?token=' + encodeURIComponent(callbackToken);
    const response = await fetch(host + '/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode, Password: password, Timestamp: timestamp,
        TransactionType: config.transactionType, Amount: amount, PartyA: phone,
        PartyB: config.shortcode, PhoneNumber: phone, CallBackURL: callbackUrl,
        AccountReference: accountReference, TransactionDesc: purpose.slice(0, 13),
      }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || String(result.ResponseCode) !== '0' || !result.CheckoutRequestID) {
      await rest('mpesa_payment_intents?id=eq.' + encodeURIComponent(String(intent.id)), {
        method: 'PATCH', body: JSON.stringify({
          status: 'failed', result_description: String(result.errorMessage || result.ResponseDescription || 'Safaricom rejected the STK request').slice(0, 500),
        }),
      });
      return reply(502, { error: 'Safaricom could not initiate the payment prompt.' });
    }
    const { response: updateResponse } = await rest('mpesa_payment_intents?id=eq.' + encodeURIComponent(String(intent.id)), {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'pending', merchant_request_id: result.MerchantRequestID,
        checkout_request_id: result.CheckoutRequestID,
        result_description: String(result.CustomerMessage || 'STK Push sent.'),
      }),
    });
    if (!updateResponse.ok) {
      return reply(502, { payment_id: intent.id, status: 'verification_required', error: 'Safaricom accepted the request but its reference could not be saved. Do not submit it again; reconcile the request.' });
    }
    return reply(200, {
      payment_id: intent.id, status: 'pending',
      customer_message: String(result.CustomerMessage || 'Check the phone and enter the M-Pesa PIN.'),
    });
  } catch (error) {
    await rest('mpesa_payment_intents?id=eq.' + encodeURIComponent(String(intent.id)), {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'verification_required',
        result_description: 'The initiation result is uncertain. Check Safaricom before creating another request.',
      }),
    });
    console.error('M-Pesa initiation uncertain', error instanceof Error ? error.message : 'unknown');
    return reply(502, { payment_id: intent.id, status: 'verification_required', error: 'The initiation result is uncertain. Check payment status before retrying.' });
  }
});
