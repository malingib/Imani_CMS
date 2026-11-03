Imani CMS finance and payment workflow

## Workspaces
Two authenticated workspaces: platform owner and church/client. Church members remain administrative records; there is no member self-service portal or personal giving dashboard.

## Finance Hub
Finance KPIs, monthly revenue/expense trends, expense category breakdown, budget utilisation and transaction history are calculated from persisted church transactions and budgets. No demo financial figures are used.

## M-Pesa STK and reconciliation
Authorised church ADMIN/TREASURER staff initiate STK requests from Finance Hub. Request-scoped random callback tokens and CheckoutRequestID correlate Safaricom callbacks; the original phone and amount are matched before the backend requests Safaricom Transaction Status Query. Only a matching Completed result with receipt and amount confirmation is posted to the church transactions ledger. A unique M-Pesa receipt index prevents duplicate ledger rows. Uncertain outcomes remain in reconciliation-required state.

For automatic reconciliation, configure the consumer key, consumer secret, Lipa na M-Pesa passkey, shortcode, Daraja API initiator username and Safaricom-encrypted security credential. The encrypted security credential is stored in Supabase Vault. STK callbacks are not cryptographically signed; the transaction-status result is the second confirmation before posting.

## MobiWave receipt SMS
Configure the MobiWave API token and sender ID. After Safaricom confirms payment and the ledger insert succeeds, the server submits a transactional receipt SMS. It stores the returned MobiWave message UID and polls the MobiWave GET /sms/{uid} report for delivery state. SMS submission or delivery failures are recorded separately and do not reverse a confirmed payment.

## Deployment
The production Imani Supabase project has both migrations applied:
- supabase/migrations/20261103092428_finance_mpesa_workflows.sql
- supabase/migrations/20261103092844_mpesa_sms_delivery_reports.sql

Edge Functions deployed: integration-settings v2, mpesa-stk v1 and mpesa-status v2. Frontend changes are delivered through the repository's Cloudflare deployment workflow. Test with sandbox Daraja credentials first: OAuth, STK initiation, callback-token validation, transaction-status result callback, duplicate handling, ledger posting and MobiWave receipt delivery report. Enable production payments only after Daraja Go Live approval and a controlled low-value payment.
