# Imani CMS — End-to-End Customer, Member and Operational Journey Audit

**Audit date:** 20 October 2026  
**Repository baseline:** `9ff628eaacfbabc4b577340a133765baa5e75ed5`  
**Production deployment:** `dpl_3x1dPA1Mc1Pn61AqLsHJRaaKyoJg` (Vercel reports READY)  
**Scope:** customer/church onboarding, member lifecycle, finance/giving, events, communications, access control, errors, accessibility, responsive UX, testing and production readiness.

## Executive summary

This is a source-level audit of the current main branch and deployment metadata. It is **not** a claim that every workflow has been browser-tested against authenticated production data. Several high-impact defects are directly visible in the code. Production release confidence remains limited until the highest-priority journeys are tested with real role accounts and controlled test records.

The product direction for this audit is **one church per installation**. Preserve authentication, role-based access, auditability, Projects and M-PESA. Do not reintroduce tenant switching or platform-wide tenant browsing as a default church-user journey. The current README documents this model, but some platform/tenant routes and components remain in the codebase and need an explicit product-boundary review.

## Priority scale

- **P0 — release blocker:** risks false success, incorrect financial actions, data loss, or an unsafe access/data boundary.
- **P1 — high:** core workflow is incomplete, error recovery is missing, or UI claims exceed actual behavior.
- **P2 — medium:** accessibility, usability, maintainability, performance, or observability gaps that can materially impair usage.
- **P3 — follow-up:** refinements after core journeys are dependable.

## Confirmed findings

### P0 — Giving can submit a zero-value STK Push

**Evidence:** `components/AppRoutes.tsx` → `handleGive` calls `triggerStkPush(0, ...)`. `components/MyGiving.tsx` collects `giftAmount` and `giftType`, but `onGive` takes no arguments, and the form delays 500 ms before calling it. The selected amount and category therefore do not reach the payment request.

**Impact:** the UI may close and appear to progress while requesting a zero-value payment. The payment request uses `src/lib/mpesa-service.ts`, which targets a legacy `VITE_LARAVEL_URL` endpoint. A successful HTTP response is treated as an STK push success without validating a provider response shape or confirming payment completion.

**Required remediation:**
1. Pass validated amount, category and phone from the giving form to the payment service.
2. Reject zero, negative, non-finite and out-of-policy amounts before any request.
3. Do not close the form until the server confirms the STK request was accepted; retain the entered amount on failure.
4. Model payment states explicitly: draft → request pending → prompt sent → confirmed / failed / expired / unknown.
5. Treat callback/webhook confirmation and reconciliation as authoritative; never record a gift as received from an STK initiation response alone.
6. Replace or explicitly validate the legacy endpoint against the intended supported backend before enabling the CTA in production.
7. Add tests for amount propagation, network timeout, duplicate click, provider rejection, callback confirmation and retry without duplicate ledger entries.

### P0 — Public sign-up reports a request that was never submitted

**Evidence:** `components/Login.tsx` `handleSignUp` validates fields then uses a two-second `setTimeout` to show “Your registration request has been sent to the church admin for approval.” It does not call the existing `signup` function in `src/lib/supabase-auth.ts`, create an auth user, link a member record, or create an approval request.

**Impact:** false confirmation and dead-end onboarding. The UI and README also need one consistent policy: the README says the first user becomes admin and subsequent users are invited. A public sign-up flow must not imply a different approval workflow or accidentally weaken first-admin provisioning.

**Required remediation:**
1. Decide and enforce the canonical entry path: invitation-only for an existing installation, or a real, explicit first-admin bootstrap with safeguards.
2. Remove the simulated success path. Either submit to a verified backend workflow and show its actual result, or remove/disable self-sign-up and explain how to request access.
3. Add tests for successful registration, duplicate email, email confirmation, no-session result, invite-only behavior and network failure.
4. Ensure auth success is not confused with member-profile creation or admin approval.

### P1 — Event reminder save is a no-op

**Evidence:** `components/EventsManagement.tsx` reminder modal says an automated SMS/email will be dispatched. “Save Reminder” only calls `setShowReminderModal(null)`; no schedule is persisted and no dispatch job is created.

**Impact:** users can reasonably believe members will receive reminders when nothing has been scheduled.

**Required remediation:** until scheduling and delivery exist, label this as an unsaved draft or remove the action. A real implementation must persist the event, recipient rules, channel, lead time, timezone and status; provide schedule/cancel state; report provider errors; and distinguish queued, sent, delivered and failed.

### P1 — Giving history and pledge indicators are synthetic

**Evidence:** `components/MyGiving.tsx` derives pledges from past giving using a 1.3 multiplier and invents a default KES 60,000 yearly target when there are no giving records. Its monthly chart uses month labels from 2024 while the active year filter is dynamic and sums by month number only.

**Impact:** members can be shown fabricated pledge commitments and a misleading timeline. This is especially sensitive financial/pastoral data.

**Required remediation:** only display stored pledges and date-bounded ledger totals. If no pledge is recorded, show “No pledge recorded” and an explicit create/request action if supported. Generate chart buckets from the selected year and show an honest empty state when there is no data.

### P1 — Communications can look sent without actual delivery

**Evidence:** `components/CommunicationCenter.tsx` builds a log and calls `onSendBroadcast(newLog)`, then switches to History and resets the form. The UI advertises SMS, email and WhatsApp. Source review did not establish that each channel is backed by a configured provider with delivery receipts and reliable recipient counts.

**Impact:** a persisted local/database log can be mistaken for provider acceptance or actual delivery. Scheduled messaging and automated verse UI also need persistence/dispatch verification.

**Required remediation:** inspect and verify the entire broadcast service path, provider configuration, recipient resolution and audit trail. Use distinct statuses (draft, queued, accepted, sent, delivered, partial, failed, cancelled). Show actual attempted/success/failed counts and preserve drafts on failure. Do not show a success state until the backend confirms the relevant stage.

### P1 — Transaction save errors are console-only

**Evidence:** `components/FinanceReporting.tsx` catches a save error and calls `console.error('Unable to save transaction:', error)`. The user-facing error path is not surfaced by this catch.

**Impact:** the user cannot reliably tell whether the transaction was saved, whether retry is safe, or what to correct.

**Required remediation:** show an accessible inline error/toast with a safe message, keep entered values, clear pending state, and allow retry. Use request IDs/idempotency for operations where duplicate financial entries are possible. Show success only after persistence succeeds.

### P1 — Member import uses blocking browser alerts and weak recovery UX

**Evidence:** `components/Membership.tsx` uses `alert()` for file size, CSV parsing, empty file, validation and partial-import outcomes. It logs import failures to the console. The handler can show partial success, but the UI does not provide a durable downloadable row-error report in the reviewed path.

**Required remediation:** use an in-page import review with column mapping/preview, row-level validation, duplicate detection, explicit partial-success counts, downloadable rejected rows and a safe retry. Validate file type/size and required fields before writing. Avoid implying all-or-nothing behavior when only valid rows were saved.

### P1 — User-visible actions and navigation conflict with single-church direction

**Evidence:** `README.md` says the deployment is one church per installation with no tenant registry or church switcher. `components/AppRoutes.tsx` still registers platform dashboard and tenant registry routes, and includes workspace switching logic.

**Impact:** product scope is ambiguous, and a future change may expose an unintended platform journey to church operators.

**Required remediation:** define whether any superadmin support workspace is retained for the configured installation. Hide/remove obsolete tenant-registry routes from the deployed product if not required. Keep server-side authorization and RLS as the actual security boundary; hiding a route is not access control. Do not delete historical database records as part of a UI cleanup.

### P1 — Error recovery is inconsistent and may expose technical details

**Evidence:** `components/shared/ErrorFallback.tsx` renders `error.message` directly to users; `components/shared/ErrorBoundary.tsx` also renders the raw exception message. Other screens use browser alerts or console-only catches. A reusable `ErrorBanner` exists but is not a consistently enforced pattern.

**Required remediation:** classify errors into safe user messages (validation, permission, offline, conflict, server failure) and retain technical details only in diagnostics. Provide retry only when retry is safe, and avoid a retry action that can duplicate financial writes. Add correlation/request identifiers to support reports without exposing stack traces or sensitive data.

### P1 — Initial data loading is capped while totals are separate

**Evidence:** `src/lib/app-data.ts` loads the first 100 rows per entity by default while separately fetching full counts. `src/lib/AppProvider.tsx` stores only the returned arrays and passes them to dashboards and reports.

**Impact:** dashboards and reports can show counts that do not reconcile with the loaded records, and a church with more than 100 members or transactions can have incomplete search, filters, exports and member portal history unless pagination is added at feature level.

**Required remediation:** define per-screen query needs. Use server-side pagination/search for member and transaction tables; use aggregate queries for totals/charts; load complete datasets only for bounded scopes. Label counts as total versus currently loaded and test at >100 rows.

### P2 — Accessibility gaps in authentication and shared feedback

**Evidence:** the password visibility control in `components/Login.tsx` has no accessible name; error/success messages are not consistently announced via live regions; labels are mostly not explicitly associated with input IDs. `components/shared/Toast.tsx` renders notifications without `role="status"`/`role="alert"` and the dismiss icon button has no accessible name. Notification toggle in `AppRoutes.tsx` has no accessible name. Several modal dialogs need an explicit review for dialog semantics, focus trapping, Escape handling, focus restoration and background interaction.

**Required remediation:**
- Every input has a programmatic label and field-level error association.
- Password visibility, notifications, close, delete and icon-only controls have meaningful accessible names.
- Use polite live announcements for routine success/loading and assertive announcements for blocking errors.
- Dialogs have `role="dialog"`, `aria-modal="true"`, a labelled title, focus management, Escape behavior where safe, and focus restoration.
- Verify all journeys by keyboard only; visible focus, logical order and no keyboard traps.
- Test contrast and target sizes; don't rely on color alone for statuses.
- Add automated axe checks, but keep manual keyboard/screen-reader review because automation is not sufficient.

### P2 — Responsive interaction patterns are inconsistent

**Evidence:** large custom modals, very small uppercase text, dense card layouts, horizontal overflow containers and inconsistent button styling appear across member, event, finance and communications screens. Some table layouts enforce a minimum width, while the mobile shell has separate navigation behavior.

**Required remediation:** establish a small set of page, form, table, dialog, empty/loading/error and button primitives. Preserve the brand palette (white surfaces, forest green, terracotta and deep pine); avoid generic gradients and excessive card nesting. At 320px, 375px, tablet and desktop widths, confirm no clipped primary actions, reachable table actions, visible focus, readable labels or scroll-lock failures.

### P2 — Member portal journey has dead-end or questionable affordances

**Evidence:** `components/MemberPortal.tsx` links to a `SERMONS` view even though the previous cleanup removed Sermon Archive and route state references. It also exposes navigation actions to Events and Groups; verify those routes exist for the member role and don't bounce to the admin dashboard. The member profile labels phone as locked to M-Pesa ID, which needs a clear explanation and safe verified update process.

**Required remediation:** audit every member-facing CTA against role permissions and actual destination. No button should route to a missing feature, silently redirect, or appear actionable when unavailable. Clearly separate profile phone number from payment-account identity; never imply the two are equivalent without a verified integration.

### P2 — Audit logs must not be the only record of an action outcome

**Evidence:** `src/lib/AppProvider.tsx` writes audit events after UI mutations and handles audit failure separately. Some UI paths call `createAudit` before the operation finishes. Audit logging is useful, but a log saying an action was initiated is not proof that the underlying operation succeeded.

**Required remediation:** define event semantics (attempted, succeeded, failed), tie logs to the real operation result and actor, and move sensitive/high-integrity audit events server-side where practical. Ensure failure to write an audit log is visible to operators without falsely reporting the primary operation as failed if it actually succeeded.

### P2 — Shared error/empty components are not a coherent system yet

**Evidence:** shared `ErrorBanner`, `ErrorFallback`, `ErrorBoundary`, `Toast`, `EmptyState` and accessibility utilities exist, but screens continue to use custom error handling and browser alerts. `EmptyState` defaults to an emoji and uses a high-emphasis yellow action style, which does not match the requested restrained product design.

**Required remediation:** standardize behavior, not only appearance. Shared components should provide consistent accessibility, retry rules, loading/disabled states and user-safe copy. Use a neutral icon and brand-consistent action treatment by default.

## Journey maps and acceptance criteria

### A. First visit → authenticated administrator

1. Landing page explains what Imani does, who it serves and the real next step.
2. Login/signup policy is unambiguous and matches server provisioning.
3. Invalid input receives inline errors; submission has a pending state and blocks duplicate clicks.
4. Wrong password, unconfirmed email, offline, expired session and service errors are distinguishable without exposing internals.
5. After authentication, role and configured church resolve deterministically; missing/ambiguous configuration blocks safely.
6. First dashboard explains empty data with the next useful action and never invents metrics.
7. Refresh, deep link, browser back/forward and logout behave consistently.

**Acceptance:** every state has a tested outcome; no success is shown before the backend confirms it.

### B. Member lifecycle

1. Add a member manually or import a CSV.
2. Validate and preview data before writing.
3. Detect likely duplicates using reviewed match rules (do not auto-merge).
4. Show persistence success only after database confirmation.
5. Open profile; edit fields; manage group/event relationships; change status with confirmation.
6. Preserve audit history and explain destructive consequences.
7. Link a login account to a member record using a verified, authorized flow.
8. Member signs in and sees only their own giving, profile and permitted activities.

**Acceptance:** failed create/update/import never silently loses the draft; duplicate clicks do not create duplicate records; member users cannot access other members' personal giving.

### C. Giving and finance

1. Member chooses category and positive amount; sees the actual phone destination.
2. Server validates amount, identity, category and idempotency.
3. STK request state is displayed truthfully.
4. Callback/reconciliation confirms or rejects the transaction.
5. Failed or unknown states explain next steps and do not duplicate ledger entries on retry.
6. Treasurer can manually record an offline transaction with a reference and actor.
7. Edit/delete actions require appropriate role, reason/confirmation and audit.
8. Reports reconcile against persisted transaction rows and clearly indicate date range and data completeness.

**Acceptance:** amount/category never disappear between form and API; no payment is recorded as received before confirmation; repeated callbacks/retries are idempotent.

### D. Events and attendance

1. Create/edit validates title, date, time and relevant fields.
2. Member RSVP persists and survives refresh.
3. Roll-call list shows actual eligible members and saved attendance.
4. Save failure preserves selections and allows retry.
5. Delete warns about affected RSVP/attendance data.
6. Reminder UI is shown only if scheduling exists; saved reminders can be inspected, changed and cancelled.

**Acceptance:** no event/reminder/attendance success is shown unless persistence or scheduling confirms it.

### E. Communications

1. Compose channel, recipient scope, content and schedule.
2. Preview recipient count and message; resolve missing contact details.
3. Require confirmation for large broadcasts and show estimated cost where supported.
4. Submit once with a pending state and an idempotency key.
5. Track provider acceptance and delivery separately.
6. Show partial failures and safe retry only for failed recipients.
7. Store consent/preferences, actor, template/version and outcome where applicable.

**Acceptance:** “sent” and “delivered” mean what the provider confirms, not just that a log row was created.

### F. Recovery and accessibility

Test all critical forms with: invalid input, slow network, offline request, authorization denied, server error, stale data/conflict, double submit, session expiry and refresh during pending state. Confirm keyboard-only operation, focus management, screen-reader announcements, contrast, zoom/reflow and mobile viewport behavior.

## Test strategy

### P0 release gates
- [ ] Auth: sign-in success/failure, session refresh, logout, first-admin and invite-only policy.
- [ ] Giving: amount/category/phone propagation; invalid amounts; duplicate submissions; provider failure; callback confirmation; reconciliation; no duplicate ledger rows.
- [ ] Authorization: ADMIN, PASTOR, TREASURER, SECRETARY and MEMBER on direct URL and direct mutation paths.
- [ ] Data isolation: RLS tests for every church-owned table and member self-service records.
- [ ] Financial writes: failed persistence retains form; retry is safe; audit semantics are correct.

### P1 workflow tests
- [ ] Member create/edit/delete, CSV preview/import/partial failure, duplicates and account linking.
- [ ] Event create/edit/delete, RSVP and attendance persistence, reminder scheduling status.
- [ ] Broadcast preview, channel provider configuration, send failure, partial delivery and retry.
- [ ] Budget/recurring expense validation and persistence.
- [ ] Dashboard/report accuracy when the database is empty, has 1 row, and exceeds 100 rows.

### P2 quality gates
- [ ] Run `npm run typecheck`, `npm run test:run`, `npm run build` and the complete Playwright suite.
- [ ] Add axe checks for login, dashboard, member list/profile/form, finance, event modal and member portal.
- [ ] Manual keyboard and screen-reader pass.
- [ ] Responsive pass at 320px, 375px, 768px, 1024px and desktop.
- [ ] Monitor runtime exceptions, provider failures and failed mutations without logging passwords, tokens or sensitive giving details.

## Recommended implementation order

1. **P0 financial/authentication correctness:** remove fake signup success; settle invite/first-admin policy; stop zero-value STK requests and correct argument flow.
2. **P1 workflow truthfulness:** event reminders, communication provider/delivery states, finance and import errors.
3. **P1 data correctness:** remove synthetic pledges; correct chart date buckets; reconcile pagination/count semantics.
4. **P1 access boundary:** reconcile remaining platform/tenant routes with single-church product direction and verify server-side RLS/role policies.
5. **P2 shared UX system:** accessible errors/toasts/forms/dialogs/empty states and consistent responsive layout.
6. **P0/P1 verification:** automated tests, authenticated role-based browser QA, production smoke tests and release evidence.

## Verification limitations

- Vercel reports the production deployment as READY and tied to the repository baseline above. This proves build/deploy completion, not authenticated workflow correctness.
- This review has not yet completed a logged-in browser run across every role or verified every remote RLS policy against the live Supabase database.
- Do not mark payment, SMS/email/WhatsApp delivery, invitation approval, or audit integrity “verified” until a controlled test proves the backend result and persisted state.
