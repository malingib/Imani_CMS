# Secure integrations

## Credential storage and access

- Daraja and MobiWave SMS credentials must never be written to browser-readable `platform_settings.flags`.
- `integration_credentials` stores configuration metadata and AES-GCM encrypted secrets. RLS is enabled and direct access is revoked from `anon` and `authenticated`.
- The `integration-config` Edge Function authenticates the current Supabase user, authorizes platform scope through trusted `app_metadata.role` / `app_metadata.system_role`, and authorizes church scope through an active `church_memberships` record with admin/administrator/treasurer role.
- The UI only receives whether credentials are configured; secret values are never returned. Empty secret fields retain previously saved values.
- Configure `INTEGRATION_ENCRYPTION_KEY` as a Supabase Edge Function secret. It must be a base64-encoded 32-byte random key. Back it up securely: losing it makes existing credentials unreadable. Never commit the key.
- Configure `INTEGRATION_ALLOWED_ORIGIN` to the production Imani origin. The current fallback is permissive for CORS only; authorization still relies on the JWT and server-side role checks.

## Provider settings

Daraja settings include environment, shortcode, transaction type and callback URL. Secrets are Consumer Key, Consumer Secret and STK Passkey. Use Sandbox for testing; use Production only after Safaricom has enabled the app and the callback endpoint is deployed and tested.

MobiWave SMS settings include the API base URL, sender ID and API credentials. The actual request contract must match the active MobiWave SMS API documentation before sending messages; this configuration screen does not assume or invent a message-send endpoint.

## Deployment sequence

1. Review and merge this branch only after CI and code review.
2. Apply `supabase/migrations/20261029120000_secure_integration_credentials.sql` to the intended Supabase project.
3. Set `INTEGRATION_ENCRYPTION_KEY` and `INTEGRATION_ALLOWED_ORIGIN` as Edge Function secrets.
4. Deploy `integration-config` with JWT verification enabled.
5. Ensure the trusted platform-admin role is present in Supabase Auth app metadata; do not grant platform access based on user-editable profile fields.
6. Test reads/writes for platform admin, church admin/treasurer, unauthorized church member and unauthenticated caller.
7. Configure provider credentials using the UI and verify they remain redacted on subsequent reads.

## Important limitations

Saving credentials is not the same as verifying connectivity. The integration-config function does not call Daraja or send SMS. Do not enable live payments until the STK initiation, callback validation, idempotent ledger posting and reconciliation flows are deployed and tested. A Safaricom callback is not cryptographically signed; validate all expected fields and reconcile transactions using Safaricom's transaction-status process.
