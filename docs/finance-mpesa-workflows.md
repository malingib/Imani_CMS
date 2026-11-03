Imani CMS finance and payment workflow

Two authenticated workspaces: platform owner and church/client. Church members remain administrative records; no member self-service portal or personal giving dashboard exists.

Finance Hub metrics and charts are calculated from persisted church transactions and budgets, not demo values.

M-Pesa STK flow: authorised church ADMIN/TREASURER staff initiate the prompt; request-scoped random callback tokens and CheckoutRequestID correlate Safaricom callbacks; phone and amount are matched; the backend then calls Safaricom Transaction Status Query. Only a matching Completed result with receipt and amount confirmation is posted to the transactions ledger. A unique M-Pesa receipt index prevents duplicate ledger rows. Uncertain outcomes remain in reconciliation-required state.

For automatic reconciliation, configure consumer key, consumer secret, Lipa na M-Pesa passkey, shortcode, Daraja API initiator username and Safaricom-encrypted security credential. The encrypted security credential is stored in Supabase Vault. The STK callback is not cryptographically signed; transaction-status verification is the second confirmation before posting.

MobiWave SMS: configure API token and sender ID. After payment confirmation and ledger insertion, a server-side Edge Function sends a transactional receipt SMS. SMS failure is recorded separately and does not reverse a confirmed payment.

Deployment: apply supabase/migrations/20261103090000_finance_mpesa_workflows.sql; deploy mpesa-stk and mpesa-status; deploy frontend; test sandbox OAuth, STK, both callbacks, reconciliation, duplicate handling, ledger posting and receipt SMS. Enable production only after Daraja Go Live approval and a controlled low-value payment.
