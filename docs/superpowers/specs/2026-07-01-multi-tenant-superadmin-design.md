# Multi-Tenant Super Admin Design

## Overview
Add a SUPER_ADMIN role for the platform owner (malingib9@gmail.com) and make the system multi-tenant. Each church is a tenant with its own data. SUPER_ADMIN manages tenants, billing, global settings, and can view any church's data.

## Roles

| Role | Scope | Purpose |
|---|---|---|
| SUPER_ADMIN | Platform-wide | Platform owner — manage tenants, billing, global settings |
| ADMIN | Church-wide | Church administrator — full access within their church |
| PASTOR | Church-wide | Church pastor — most modules, limited system settings |
| TREASURER | Church-wide | Finance module, read-only other modules |
| SECRETARY | Church-wide | Member/event management, limited finance |
| MEMBER | Church-wide | Portal, giving, basic profile |

## Data Model

### New Tables

**churches**
- `id` UUID PK
- `name` TEXT
- `slug` TEXT UNIQUE
- `logo_url` TEXT
- `address` TEXT
- `phone` TEXT
- `email` TEXT
- `tier` TEXT (basic/pro)
- `status` TEXT (active/suspended)
- `created_at` TIMESTAMPTZ

**subscriptions**
- `id` UUID PK
- `church_id` UUID FK → churches
- `tier` TEXT
- `status` TEXT (active/cancelled/expired)
- `start_date` TIMESTAMPTZ
- `end_date` TIMESTAMPTZ
- `stripe_subscription_id` TEXT (future)

**invoices**
- `id` UUID PK
- `church_id` UUID FK → churches
- `subscription_id` UUID FK → subscriptions
- `amount` NUMERIC
- `status` TEXT (pending/paid/overdue)
- `due_date` DATE
- `paid_at` TIMESTAMPTZ

**invitations**
- `id` UUID PK
- `church_id` UUID FK → churches
- `email` TEXT
- `role` TEXT
- `token` TEXT UNIQUE
- `expires_at` TIMESTAMPTZ
- `accepted_at` TIMESTAMPTZ

### Existing Tables — Add `church_id` Column

All data-scoped tables get a `church_id UUID NOT NULL REFERENCES churches(id)` column:
- members
- transactions
- church_events
- event_attendance
- groups
- group_members
- communications
- activities
- budgets
- recurring_expenses
- sermons
- notifications
- audit_logs

### Auth Metadata

User metadata and app_metadata carry:
- `role` — SUPER_ADMIN | ADMIN | PASTOR | TREASURER | SECRETARY | MEMBER
- `church_id` — null for SUPER_ADMIN, set for church users

## RLS Strategy

Universal policy on every data table:
```sql
CREATE POLICY "tenant_isolation" ON members FOR ALL
USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
```

Plus an exception for SUPER_ADMIN (bypass via service_role key, or add RLS policy that allows all for SUPER_ADMIN role).

SUPER_ADMIN does NOT need row-level bypass in the frontend — they switch church via a dropdown, which sets `activeChurchId` context. Queries filter by that value. SUPER_ADMIN's own auth user record has no church_id.

## UI: Super Admin Panel

### Navigation
- New "Platform" nav section visible only to SUPER_ADMIN
- Platform section items: Dashboard, Tenants, Invitations, Billing, Global Settings
- "Switch Church" dropdown in header when viewing tenant data
- "Back to Platform" breadcrumb when drilling into a church

### Platform Dashboard
Aggregated stats across all churches:
- Total churches (active/suspended)
- Total members across all churches
- Total revenue (sum of transactions income)
- Recent signups
- System health

### Tenants View
- Table of all churches with status, tier, member count
- Click to drill into any church's admin dashboard
- Create new church (modal with name, admin email, tier)
- Suspend/activate church

### Invitations View
- Send invite form (email, role)
- Pending/expired/accepted list
- Resend/cancel invites

### Billing View
- Subscription list per church
- Invoice history
- Tier management

### Global Settings View
- Feature flags (SMS toggle, AI toggle)
- Default limits (max members per tier, etc.)
- Maintenance mode

## Onboarding Flow

1. **Super admin** creates church → enters name, admin email, tier
2. System creates church record + sends invite to admin email
3. **Church admin** accepts invite → guided setup wizard:
   a. Church profile (logo, address, contact)
   b. First members (import or add)
4. Church is active — admin uses full CMS

## Implementation Order

1. Add `SUPER_ADMIN` to UserRole enum ✓
2. Create churches table + subscription tables (migration)
3. Add church_id to all data tables (migration)
4. Update RLS policies
5. Build Platform nav + super admin panel views
6. Build tenant switching (church context)
7. Build invitations flow
8. Build billing UI
9. Build onboarding wizard

## Accounts

| Email | Password | Role |
|---|---|---|
| malingib9@gmail.com | b1216170 | SUPER_ADMIN |
| admin@demo.church | demo123456 | ADMIN |
