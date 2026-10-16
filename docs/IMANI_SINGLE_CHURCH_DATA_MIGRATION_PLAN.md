# Imani: Single-Church Database Migration Plan

**Status:** Plan only — not applied to Supabase production  
**Canonical church:** Demo Church (`00000000-0000-0000-0000-000000000001`)  
**Supabase project:** Imani (`rmwqkqkhdkslezoskiol`)  
**Decision:** Archive every other church and its data. Do not merge other-church records into Demo Church. Do not delete records until archive verification has passed and the resulting counts have been reviewed.

## 1. Current production inventory (read-only audit, 2026-10-16)

Church registry records:

| Church | ID | Current status | Decision |
|---|---|---|---|
| Demo Church | `00000000-0000-0000-0000-000000000001` | active | Keep as canonical |
| Demo church 2 | `0f77487b-465c-4928-8d3a-681d745fff9b` | trialing | Archive; retain |
| Demo 3 | `528eec44-bd05-4306-8776-51386abcc105` | trialing | Archive; retain |
| Kakamega Ack | `09604864-a61a-4d5b-8e7a-712931e54cbc` | trialing | Archive; retain |

The database contains non-canonical rows, including 13 audit log rows, 1 event, 1 church membership, 2 invitations, 2 members, 3 subscriptions, and 3 transactions. These are **25 rows across those seven tables**. The live audit also found 5 Demo Church groups and 5 Demo Church members, plus 5 Demo Church transactions, 3 Demo Church events, and 1 Demo Church membership. There are other church-scoped tables with zero rows today; the archive process must still inventory them rather than assume they will always remain empty.

The status constraint currently accepts `active`, `suspended`, `trialing`, and `onboarding`, but not `archived`. Adding an `archived` status must be a deliberate migration. Current RLS policies still reference `church_id`, `church_memberships`, `is_church_member()`, `app_church_id()`, and, in some policies, a `SUPER_ADMIN` bypass. Therefore, marking a church archived alone is **not** a security boundary.

## 2. Non-negotiable safety rules

1. Take a Supabase backup/restore point before writes and confirm the backup is restorable.
2. Do not merge rows from another church into Demo Church.
3. Do not delete any church, member, transaction, invitation, audit entry, or related record during the initial archival phase.
4. Keep an immutable JSONB snapshot of each non-canonical row, including its source table and church ID, in a non-exposed archive schema. Preserve primary keys and the full original row.
5. Make the archive process idempotent, with a batch identifier and uniqueness guard so reruns do not duplicate snapshots.
6. Compare source and archive counts **per table and per church**, and compare primary-key sets / row hashes. Stop on any mismatch.
7. Keep archive tables inaccessible to `anon` and `authenticated`; use a privileged maintenance path only. Do not expose the archive schema through the Supabase Data API.
8. Do not drop `church_id`, church memberships, policies, functions, views, or tables until the application and all dependencies have been converted and tested.
9. Run the migration in staging first, then run typecheck, automated tests, role-based access tests, and a full smoke test against the staging database.
10. Treat RLS as a separate security deliverable. Do not enable RLS on `member_change_log` without first writing and testing the intended policy.

## 3. Phased migration

### Phase A — freeze and baseline (read-only until backup is verified)

- Pause signup/invitation flows that can create new church records during the cutover window.
- Record the current schema, migration ledger, constraints, foreign keys, policies, functions, triggers, views, grants, and table row counts.
- Export the four `churches` records and all non-canonical church-scoped rows before changing any status or policy.
- Record counts and hashes for all 30 public objects with a `church_id` column; distinguish base tables from views.
- Verify that the backup can be restored to a temporary/staging project.

**Gate A:** No write migration until backup and baseline exports are verified.

### Phase B — create a restricted archive (additive only)

- Create a non-exposed schema such as `imani_archive` and a snapshot table with: batch ID, source table, church ID, source primary-key JSON, row hash, complete row JSONB, and snapshot timestamp.
- Snapshot every row whose `church_id` is not the canonical Demo Church ID from every public **base table** that has a `church_id` column. Include membership, invitations, finance, events, audit, and relationship tables. Do not snapshot views as if they were independent source records.
- Snapshot the three non-canonical church registry records separately because `churches` itself does not have a `church_id` column.
- Keep all source rows unchanged during this phase.
- Restrict archive schema privileges; verify that `anon` and `authenticated` cannot read it.
- Run idempotency checks by re-running the snapshot against the same baseline and confirming no extra copies appear.

**Gate B:** Per-table source counts, archive counts, primary-key sets, and row hashes must match. No source rows have been removed.

### Phase C — mark other church records archived

- Add `archived` to the allowed church status values in a reviewed migration.
- Set the three non-canonical church records to `archived`; do not delete them.
- Preserve their membership, subscription, invitation, financial, member, event, and audit rows in the source tables until Phase D has passed its verification gate.
- Update all access policies so ordinary users can access only the canonical church dataset. Remove the platform-wide `SUPER_ADMIN` bypass from tenant-data policies as part of the single-church security conversion; never rely on a frontend-hidden menu for authorization.
- Add tests proving non-canonical records cannot be read or modified through the Data API, including by a user with the legacy `SUPER_ADMIN` role.

**Gate C:** Staging tests confirm canonical users cannot access any non-canonical data through REST/RPC, even if old memberships exist.

### Phase D — convert operational tables to the single-church model

- Search the entire repository for `church_id`, church context, church memberships, church resolution, church creation, tenant RPCs, tenant-specific RLS, and domain routing. Update all select/insert/update/delete operations and server functions first.
- Introduce a single-church profile/settings record that is not a tenant registry. Preserve the Demo Church identity, branding, contact details, and configuration there.
- Convert views, triggers, RPCs, and constraints to the single-church schema. Remove platform tenant management and tenant onboarding from the backend as well as the UI.
- On staging only, remove non-canonical rows from the operational tables **only after** the archive comparison has passed and a human has reviewed the verification report. Archive copies remain available.
- Remove `church_id` columns, foreign keys to `churches`, membership/domain registry objects, and tenant helper functions only after a dependency scan proves nothing still references them. Preserve user accounts, roles, application audit history, transaction references, project links, and member relationships.
- Keep role-based permissions and RLS on all exposed tables. Rebuild policies for the single-church authorization model rather than disabling RLS.

**Gate D:** Staging database has no runtime dependency on tenant IDs; application smoke tests and role/security tests pass; archive is independently readable by authorized maintainers.

### Phase E — production cutover and post-checks

- Take a fresh backup immediately before cutover.
- Deploy the matching application build and schema migration together during a maintenance window.
- Re-run the same source/archive verification report and the app smoke tests.
- Check member, event, group, project, transaction, invitation, subscription, audit, and finance workflows.
- Keep the archive read-only for a defined retention period. Any later purge must be a separate, explicitly approved operation after restore testing and retention review.

## 4. Verification SQL / reports required before any cleanup

For each table, produce a report with:
- canonical rows remaining in the operational table;
- non-canonical source rows at baseline;
- archived snapshots for the same source table and church;
- missing primary keys;
- row-hash mismatches;
- duplicate snapshots;
- rows with a null or invalid `church_id`;
- foreign-key orphans in related tables.

The cutover must fail closed if any source/archive count or hash differs. Do not use total counts alone: two tables can have the same count while different records are missing.

## 5. Current state and next implementation task

- The application-only single-church refactor is in draft PR #13: https://github.com/malingib/Imani_CMS/pull/13
- CI (TypeScript typecheck and Vitest) passed on the latest branch commit at the time of this plan.
- No production schema or data was changed for this plan.
- Added a draft additive-only snapshot script at `supabase/operations/archive_noncanonical_churches.sql`. It creates a restricted archive schema and snapshots non-canonical church rows without updating or deleting source records. It has not been executed against production. Next: test it against a restored staging copy; produce the per-table verification report; then review Phase C security-policy changes before production execution.

## 6. Known security issue

Supabase currently reports `public.member_change_log` as having RLS disabled. The suggested one-line `ENABLE ROW LEVEL SECURITY` operation is not sufficient by itself; add and test the intended policy before enabling RLS, otherwise existing application access may fail. Do not bundle an unreviewed policy change into the archive operation.
