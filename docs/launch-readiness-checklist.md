# Imani CMS Launch Readiness Checklist

Status date: 2026-07-01

## Steelmanned Product Thesis

Imani CMS should launch as a Supabase-backed, multi-tenant church management SaaS with a SUPER_ADMIN platform layer, church-scoped dashboards, membership, finance, events, communication, reporting, billing, invitations, and AI-assisted ministry workflows. The current codebase has a usable React shell, real Supabase auth/data reads for some core entities, local migrations, and mocked E2E coverage for the platform flows. The remaining work is to make the half-built surfaces durable, secure, documented, and handover-ready.

## Current Verified State

- [x] Production build succeeds with `npm run build`.
- [x] Existing Playwright suite passes: 19 tests.
- [x] Supabase CLI can access linked remote project `rmwqkqkhdkslezoskiol` / `Imani`.
- [x] Local migrations exist for base domain schema and multi-tenant schema.
- [ ] Remote database is not aligned: local migration `00002_multi_tenant.sql` is not applied remotely.
- [ ] Most user-facing mutations are still local React state changes only.
- [ ] Secrets are present in local env/example files and must be rotated/cleaned before handover.

## Launch Blockers

- [ ] Apply and verify remote migration `00002_multi_tenant.sql`.
- [ ] Enable RLS on all existing tenant-scoped domain tables, not only new platform tables.
- [ ] Add SUPER_ADMIN-safe policies for platform tables and aggregate views.
- [ ] Replace local-only member create/update/delete with Supabase writes.
- [ ] Replace local-only finance transaction create/update/delete with Supabase writes.
- [ ] Replace local-only event create/delete/attendance updates with Supabase writes.
- [ ] Replace local-only member portal profile updates with Supabase writes.
- [ ] Remove role simulation controls from production UI.
- [ ] Move Gemini calls out of the browser bundle and route all AI requests through Supabase Edge Functions.
- [ ] Remove real secrets from `.env.example`; rotate any exposed Gemini key.
- [ ] Confirm production Supabase auth metadata for `SUPER_ADMIN`, church users, and member users.
- [ ] Add real error states for failed Supabase reads/writes instead of silent fallback to empty data.

## Security & Data Isolation

- [ ] Audit RLS state for `members`, `transactions`, `church_events`, `event_attendance`, `groups`, `group_members`, `communications`, `activities`, `budgets`, `recurring_expenses`, `sermons`, `notifications`, and `audit_logs`.
- [ ] Add `WITH CHECK` policies for inserts/updates so users cannot write rows into another church.
- [ ] Decide SUPER_ADMIN access model: service-role Edge Functions or explicit JWT role policies.
- [ ] Validate that frontend aggregate queries cannot leak cross-tenant data to non-SUPER_ADMIN users.
- [ ] Stop trusting client-provided `church_id`; derive it server-side or enforce via RLS.
- [ ] Add invite acceptance flow that assigns `role` and `church_id` in auth metadata.
- [ ] Add account deactivation/suspension behavior for suspended churches.
- [ ] Add audit logs for privileged tenant, billing, invitation, and settings actions.
- [ ] Document key rotation and incident response steps.

## Product Completeness

- [ ] Membership: persist add, bulk import, edit, delete, profile photo, status changes.
- [ ] Finance: persist transactions, budgets, recurring expenses, edits, deletes.
- [ ] Events: persist events, RSVP, attendance, recurrence.
- [ ] Groups: persist departments/groups and membership assignment.
- [ ] Communication: persist broadcast logs; integrate SMS/email/WhatsApp provider or clearly mark unavailable.
- [ ] Reports: define export formats and verify data comes from persisted records.
- [ ] Sermons: wire `SERMONS` route to `SermonHistory`; persist sermon records if admin-managed.
- [ ] Notifications: load, mark read, mark all read, delete.
- [ ] Billing: decide whether it is display-only MVP or real billing integration; remove fake affordances if display-only.
- [ ] Platform settings: add migration/table for `platform_settings` if not already live.
- [ ] Tenant creation: create church, subscription, invitation, and admin onboarding as one reliable workflow.
- [ ] Onboarding: build first church setup wizard or document manual setup process.

## Architecture Cleanup

- [ ] Pick one backend path for launch: Supabase-first or Express/BetterAuth/Drizzle. Archive or reclassify the unused Express plan.
- [ ] Extract Supabase repository functions instead of concentrating app data orchestration in `components/App.tsx`.
- [ ] Replace `any` mappers with generated or explicit Supabase row types.
- [ ] Normalize enum values between TypeScript and Postgres.
- [ ] Add mutation helpers that return typed success/error results.
- [ ] Add loading/empty/error components shared across feature screens.
- [ ] Code-split heavy views and AI/chart/map modules to reduce the 1.4 MB JS bundle.
- [ ] Remove unused imports and unreachable route cases.
- [ ] Replace stale README AI Studio text with project-specific setup/deploy docs.

## Testing

- [x] Mocked Playwright platform suite passes.
- [ ] Add unit tests for mappers and church-scoped query builders.
- [ ] Add integration tests against local Supabase for migrations and RLS.
- [ ] Add E2E coverage for login success, failed login, logout, and auth redirects.
- [ ] Add E2E coverage for persisted member CRUD.
- [ ] Add E2E coverage for persisted transaction CRUD.
- [ ] Add E2E coverage for tenant switching data isolation.
- [ ] Add E2E coverage for non-SUPER_ADMIN attempting platform routes.
- [ ] Add smoke test against production/staging Supabase before launch.
- [ ] Add CI workflow for build, typecheck, lint if added, and Playwright.

## Deployment & Operations

- [ ] Define staging and production Supabase projects.
- [ ] Apply migrations through a repeatable command, not manual SQL paste.
- [ ] Configure Edge Function secrets for Gemini and any communication providers.
- [ ] Deploy Gemini Edge Function and verify CORS/auth behavior.
- [ ] Configure Vercel environment variables.
- [ ] Add custom domain and SSL.
- [ ] Add app monitoring/error reporting.
- [ ] Add database backups and recovery drill.
- [ ] Add basic uptime check.
- [ ] Define launch rollback plan.

## Handover Package

- [ ] Rewrite README with install, env, local Supabase, test, build, deploy, and troubleshooting steps.
- [ ] Add `.env.example` with placeholders only.
- [ ] Document roles and permissions.
- [ ] Document tenant onboarding.
- [ ] Document migration workflow.
- [ ] Document AI/communication/billing provider setup.
- [ ] Document known limitations for MVP.
- [ ] Add admin user setup instructions without real passwords.
- [ ] Add screenshots or short walkthrough for the main flows.
- [ ] Add release checklist and ownership notes.

## Strongest Challenges Before Launch

1. The UI can pass demos while losing data on refresh because many feature actions only update local state.
2. Multi-tenancy is the core SaaS claim, but the remote database has not applied the multi-tenant migration.
3. RLS policy definitions are not enough if RLS is not enabled on the existing domain tables.
4. AI is currently configured in a way that can expose keys in the browser bundle; the Edge Function path exists but is not the only path.
5. The codebase carries two architecture stories: an unfinished Express backend plan and an implemented Supabase direction. This will confuse future maintainers unless one is made official.

## Recommended Completion Order

1. Security/data alignment: remote migrations, RLS, auth metadata, secret cleanup.
2. Persistence: replace local-only mutations for members, finance, events, profile, notifications.
3. Production architecture: Supabase-first service layer, AI via Edge Functions, remove role simulation.
4. Tests: local Supabase/RLS integration tests plus persisted CRUD E2E.
5. Handover: README, env docs, deployment runbook, known limitations.
6. Launch: staging smoke, production migration, production smoke, rollback plan.
