import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-secret',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function normalizeAccount(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

function extractCallback(body: any) {
  const item = body?.Body?.stkCallback ?? body?.stkCallback ?? body;
  const metadata = item?.CallbackMetadata?.Item ?? body?.CallbackMetadata?.Item ?? [];
  const get = (name: string) => metadata.find((x: any) => x.Name === name)?.Value;
  return {
    checkoutRequestId: item?.CheckoutRequestID ?? body?.CheckoutRequestID ?? null,
    merchantRequestId: item?.MerchantRequestID ?? body?.MerchantRequestID ?? null,
    resultCode: Number(item?.ResultCode ?? body?.ResultCode ?? 0),
    resultDescription: item?.ResultDesc ?? body?.ResultDesc ?? null,
    amount: Number(get('Amount') ?? body?.Amount ?? 0),
    mpesaReceipt: String(get('MpesaReceiptNumber') ?? body?.MpesaReceiptNumber ?? '').trim(),
    phoneNumber: String(get('PhoneNumber') ?? body?.PhoneNumber ?? '').trim(),
    transactionDate: get('TransactionDate') ?? body?.TransactionDate ?? null,
    accountReference: normalizeAccount(body?.AccountReference ?? body?.accountReference ?? body?.BillRefNumber),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);

  const callbackSecret = Deno.env.get('MPESA_CALLBACK_SECRET');
  if (callbackSecret) {
    const supplied = req.headers.get('x-callback-secret');
    if (!supplied || supplied !== callbackSecret) return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const event = extractCallback(body);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    // Failed STK callbacks are acknowledged but never recorded as contributions.
    if (event.resultCode !== 0) {
      return json({ ok: true, accepted: false, resultCode: event.resultCode });
    }

    if (!event.mpesaReceipt || !event.amount || event.amount <= 0 || !event.accountReference) {
      return json({ error: 'Incomplete successful payment callback' }, 422);
    }

    // Resolve the church/project exclusively from the server-side payment-account mapping.
    const { data: account, error: accountError } = await supabase
      .from('project_accounts')
      .select('id, church_id, project_id, account_prefix, active')
      .eq('account_prefix', event.accountReference)
      .eq('active', true)
      .maybeSingle();

    if (accountError) return json({ error: accountError.message }, 500);
    if (!account) return json({ error: 'Unknown or inactive project account' }, 422);

    // Store the raw event first. The database unique constraint on receipt/reference
    // makes retries safe and prevents duplicate financial transactions.
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
      }, { onConflict: 'mpesa_receipt', ignoreDuplicates: false })
      .select('id, status')
      .maybeSingle();

    if (eventError) return json({ error: eventError.message }, 500);

    // Replayed callback: acknowledge without creating a second transaction.
    if (paymentEvent?.status === 'PROCESSED') {
      return json({ ok: true, duplicate: true });
    }

    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', event.mpesaReceipt)
      .maybeSingle();

    if (!existingTx) {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          church_id: account.church_id,
          project_id: account.project_id,
          member_id: null,
          member_name: event.phoneNumber || 'M-Pesa contributor',
          amount: event.amount,
          type: 'Project',
          payment_method: 'M-Pesa',
          date: new Date().toISOString(),
          reference: event.mpesaReceipt,
          category: 'Income',
          notes: `Project contribution via PayBill account ${event.accountReference}`,
          phone_number: event.phoneNumber || null,
          source: 'INTEGRATED',
        })
        .select('id')
        .single();

      if (txError) return json({ error: txError.message }, 500);

      if (paymentEvent?.id) {
        await supabase.from('mpesa_payment_events').update({
          status: 'PROCESSED',
          transaction_id: transaction.id,
          processed_at: new Date().toISOString(),
        }).eq('id', paymentEvent.id);
      }
    } else if (paymentEvent?.id) {
      await supabase.from('mpesa_payment_events').update({
        status: 'PROCESSED',
        transaction_id: existingTx.id,
        processed_at: new Date().toISOString(),
      }).eq('id', paymentEvent.id);
    }

    return json({ ok: true, accepted: true, receipt: event.mpesaReceipt, projectId: account.project_id });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid callback' }, 400);
  }
});
