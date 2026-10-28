# Imani CMS M-Pesa Daraja production setup

## What this adds

- `mpesa_payment_intents`: church-scoped payment requests and callback outcomes.
- `mpesa-stk` Supabase Edge Function: authenticated STK Push initiation plus the Safaricom callback handler.
- The browser never receives Daraja consumer credentials or the M-Pesa passkey.

## Required Supabase Edge Function secrets

Set these in **Supabase Dashboard → Project Settings → Edge Functions → Secrets** for the existing Imani project:

- `MPESA_CONSUMER_KEY` — production Daraja consumer key
- `MPESA_CONSUMER_SECRET` — production Daraja consumer secret
- `MPESA_SHORTCODE` — live PayBill/shortcode used for the STK request
- `MPESA_PASSKEY` — live Lipa na M-Pesa Online passkey issued after Go Live
- `MPESA_CALLBACK_URL` — public HTTPS callback URL: `https://rmwqkqkhdkslezoskiol.supabase.co/functions/v1/mpesa-stk`
- `MPESA_TRANSACTION_TYPE` — `CustomerPayBillOnline` for PayBill or `CustomerBuyGoodsOnline` for Till
- `MPESA_PARTY_B` — optional credit party; defaults to `MPESA_SHORTCODE`
- `MPESA_ALLOWED_ORIGIN` — optional frontend origin, e.g. `https://imani.co.ke`

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions in the project environment. Never put the service-role key, consumer secret or passkey in Vite environment variables, source control, browser storage, or frontend code.

## Deploy

1. Review and apply `supabase/migrations/20261028230000_mpesa_payment_intents.sql` to the existing Imani Supabase project.
2. Deploy `supabase/functions/mpesa-stk/index.ts` as the `mpesa-stk` Edge Function.
3. Ensure the function's JWT gateway verification is disabled for this endpoint because Safaricom callbacks do not include a Supabase JWT. The function explicitly validates the Supabase user JWT for payment-initiation requests and treats callback-shaped requests separately.
4. In Daraja Go Live, ensure the application is approved for production M-Pesa Express and the shortcode, transaction type and passkey match the live account.
5. Test with a controlled, low-value payment and confirm the receipt in the M-Pesa business portal before enabling church-wide use.

## Initiation contract

Authenticated POST to `/functions/v1/mpesa-stk`:

```json
{
  "church_id": "UUID",
  "member_id": "optional-member-UUID",
  "phone_number": "0712345678",
  "amount": 100,
  "purpose": "Tithe"
}
```

A successful initiation response means only that Daraja accepted the STK request. It does **not** mean the payment is complete. The member must approve the prompt and the callback must arrive. Callback results are correlated by the server-generated CheckoutRequestID and successful metadata is checked against amount and phone number.

## Important current limitation

This initial integration stores the payment intent and its callback result. It does not yet post a confirmed payment into the existing `transactions` ledger or render the payment workflow in the Finance Hub. That linkage must be implemented and tested before considering the integration complete for production accounting. Callback data is not cryptographically signed by Daraja; reconcile receipts with the M-Pesa business portal and use transaction-status reconciliation for uncertain outcomes.
