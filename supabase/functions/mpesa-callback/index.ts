import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-secret',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const normalizeAccount = (value: unknown) => String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
const normalizePhone = (value: unknown) => String(value ?? '').replace(/\D/g, '').slice(-12);

function extractCallback(body: any) {
  const item = body?.Body?.stkCallback ?? body?.stkCallback ?? body;
  const metadata = item?.CallbackMetadata?.Item ?? body?.CallbackMetadata?.Item ?? [];
  const get = (name: string) => metadata.find((x: any) => x.Name === name)?.Value;
  const businessShortCode = body?.BusinessShortCode ?? body?.businessShortCode ?? body?.Body?.BusinessShortCode ?? null;
  return {
    businessShortCode: businessShortCode ? String(businessShortCode).trim() : null,
    checkoutRequestId: item?.CheckoutRequestID ?? body?.CheckoutRequestID ?? null,
    merchantRequestId: item?.MerchantRequestID ?? body?.MerchantRequestID ?? null,
    resultCode: Number(item?.ResultCode ?? body?.ResultCode ?? 0),
    resultDescription: item?.ResultDesc ?? body?.ResultDesc ?? null,
    amount: Number(get('Amount') ?? body?.TransAmount ?? body?.Amount ?? 0),
    mpesaReceipt: String(get('MpesaReceiptNumber') ?? body?.TransID ?? body?.MpesaReceiptNumber ?? '').trim(),
    phoneNumber: normalizePhone(get('PhoneNumber') ?? body?.MSISDN ?? body?.PhoneNumber),
    transactionDate: get('TransactionDate') ?? body?.TransTime ?? body?.TransactionDate ?? null,
    accountReference: normalizeAccount(body?.BillRefNumber ?? body?.AccountReference ?? body?.accountReference),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);

  const callbackSecret = Deno.env.get('MPESA_CALLBACK_SECRET');
  if (callbackSecret && req.headers.get('x-callback-secret') !== callbackSecret) return json({ error: 'Unauthorized' }, 401);

  try {
    const body = await req.json();
    const event = extractCallback(body);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    // Safely acknowledge rejected/failed callbacks without creating income.
    if (event.resultCode !== 0) return json({ ok: true, accepted: false, resultCode: event.resultCode });
    if (!event.mpesaReceipt || event.amount <= 0 || !event.accountReference || !event.businessShortCode) {
      return json({ error: 'Successful callback is missing PayBill, account, receipt or amount' }, 422);
    }

    // First resolve the PayBill to a church. The account prefix is then resolved
    // within that church, preventing the same prefix in another church from colliding.
    const { data: paymentAccount, error: paymentAccountError } = await supabase
      .from('church_payment_accounts')
      .select('id, church_id, paybill_number')
      .eq('paybill_number', event.businessShortCode)
      .eq('provider', 'MPESA')
      .eq('account_type', 'PAYBILL')
      .eq('active', true)
      .maybeSingle();

    if (paymentAccountError) return json({ error: paymentAccountError.message }, 500);
    if (!paymentAccount) return json({ error: 'Unregistered PayBill' }, 422);

    const { data: account, error: accountError } = await supabase
      .from('project_accounts')
      .select('id, church_id, project_id, account_prefix, active')
      .eq('church_id', paymentAccount.church_id)
      .eq('account_prefix', event.accountReference)
      .eq('active', true)
      .maybeSingle();

    if (accountError) return json({ error: accountError.message }, 500);
    if (!account) return json({ error: 'Unknown or inactive project account' }, 422);

    const { data: paymentEvent, error: eventError } = await supabase
      .from('mpesa_payment_events')
      .upsert({
        church_id: account.church_id,
        project_id: account.project_id,
        project_account_id: account.id,
        mpesa_receipt: event.mpesaReceipt,
        checkout_request_id: event.checkoutRequestId,
        merchant_request_id: event.merchantRequestId,
        amount: event.amount,
        phone_number: event.phoneNumber || null,
        account_reference: event.accountReference,
        result_code: event.resultCode,
        result_description: event.resultDescription,
        payload: body,
        status: 'RECEIVED',
      }, { onConflict: 'mpesa_receipt' })
      .select('id, status')
      .maybeSingle();

    if (eventError) return json({ error: eventError.message }, 500);
    if (paymentEvent?.status === 'PROCESSED') return json({ ok: true, duplicate: true });

    // Best-effort member matching. An unmatched contribution remains valid and
    // is visible to authorized finance users for reconciliation.
    let memberId: string | null = null;
    let memberName = event.phoneNumber ? `M-Pesa contributor (${event.phoneNumber})` : 'M-Pesa contributor';
    if (event.phoneNumber) {
      const { data: members } = await supabase
        .from('members')
        .select('id, first_name, last_name, phone')
        .eq('church_id', account.church_id)
        .limit(50);
      const normalized = event.phoneNumber;
      const match = (members || []).find((m: any) => normalizePhone(m.phone) === normalized);
      if (match) {
        memberId = match.id;
        memberName = [match.first_name, match.last_name].filter(Boolean).join(' ') || memberName;
      }
    }

    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', event.mpesaReceipt)
      .maybeSingle();

    let transactionId = existingTx?.id ?? null;
    if (!transactionId) {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          church_id: account.church_id,
          project_id: account.project_id,
          member_id: memberId,
          member_name: memberName,
          amount: event.amount,
          type: 'Project',
          payment_method: 'M-Pesa',
          date: event.transactionDate ? new Date(String(event.transactionDate)).toISOString() : new Date().toISOString(),
          reference: event.mpesaReceipt,
          category: 'Income',
          notes: `Project contribution via PayBill ${event.businessShortCode}, account ${event.accountReference}`,
          phone_number: event.phoneNumber || null,
          source: 'INTEGRATED',
        })
        .select('id')
        .single();
      if (txError) return json({ error: txError.message }, 500);
      transactionId = transaction.id;
    }

    if (paymentEvent?.id) {
      await supabase.from('mpesa_payment_events').update({
        status: 'PROCESSED',
        transaction_id: transactionId,
        processed_at: new Date().toISOString(),
      }).eq('id', paymentEvent.id);
    }

    return json({ ok: true, accepted: true, duplicate: !!existingTx, receipt: event.mpesaReceipt, projectId: account.project_id, memberMatched: !!memberId });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid callback' }, 400);
  }
});
