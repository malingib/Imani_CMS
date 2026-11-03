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
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: ANON_KEY, Authorization: authorization },
  });
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
async function canViewFinance(userId: string, churchId: string) {
  const query = new URLSearchParams({
    select: 'role,status', user_id: 'eq.' + userId, church_id: 'eq.' + churchId, status: 'eq.active', limit: '1',
  });
  const { response, data } = await rest('church_memberships?' + query);
  return response.ok && Array.isArray(data) && ['ADMIN', 'TREASURER'].includes(String(data[0]?.role || ''));
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) return reply(500, { error: 'Payment service is not configured.' });

  const user = await authenticate(req.headers.get('Authorization'));
  if (!user) return reply(401, { error: 'Sign in to view payment status.' });

  let body: Obj;
  try { body = await req.json(); } catch { return reply(400, { error: 'Invalid request body.' }); }
  const paymentId = String(body.payment_id || '');
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return reply(400, { error: 'A valid payment ID is required.' });

  const { response, data } = await rest(
    'mpesa_payment_intents?select=id,church_id,payer_name,phone_number,amount,purpose,status,mpesa_receipt_number,result_description,created_at,updated_at&id=eq.' + encodeURIComponent(paymentId),
  );
  if (!response.ok) return reply(502, { error: 'Could not retrieve payment status.' });
  const intent = Array.isArray(data) ? data[0] as Obj | undefined : undefined;
  if (!intent) return reply(404, { error: 'Payment request not found.' });
  if (!await canViewFinance(String(user.id), String(intent.church_id))) {
    return reply(403, { error: 'You do not have permission to view this church payment.' });
  }

  return reply(200, {
    payment_id: intent.id,
    status: intent.status,
    receipt_number: intent.mpesa_receipt_number || null,
    message: intent.result_description || 'Payment request is being processed.',
    payer_name: intent.payer_name || null,
    phone_number: intent.phone_number,
    amount: intent.amount,
    purpose: intent.purpose,
    created_at: intent.created_at,
    updated_at: intent.updated_at,
  });
});
