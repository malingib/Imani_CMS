# Multi-Tenant Super Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Make the system multi-tenant with SUPER_ADMIN platform owner.

**Architecture:** Same SPA, SUPER_ADMIN role gates "Platform" nav section with tenants, billing, global settings. Church-scoped data via `church_id` column on all tables. RLS isolates tenants.

**Tech Stack:** Supabase (DB + Auth), Vite/React, TypeScript

## Global Constraints
- SUPER_ADMIN can view any church's data; church users see only their church
- All data tables get `church_id UUID NOT NULL REFERENCES churches(id)`
- RLS policy: `church_id = auth.jwt() ->> 'church_id'`
- SUPER_ADMIN has no church_id in their auth record

---

### Task 1: Database Migration — Churches + church_id

**Files:**
- Create: `supabase/migrations/00002_multi_tenant.sql`

- Run migration against remote DB via REST API (pg client or supabase)

**Migration SQL:**
```sql
-- Churches table
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Default church
INSERT INTO churches (id, name, slug, tier, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Church', 'demo-church', 'pro', 'active');

-- Add church_id columns
ALTER TABLE members ADD COLUMN church_id UUID;
ALTER TABLE transactions ADD COLUMN church_id UUID;
ALTER TABLE church_events ADD COLUMN church_id UUID;
ALTER TABLE event_attendance ADD COLUMN church_id UUID;
ALTER TABLE groups ADD COLUMN church_id UUID;
ALTER TABLE group_members ADD COLUMN church_id UUID;
ALTER TABLE communications ADD COLUMN church_id UUID;
ALTER TABLE activities ADD COLUMN church_id UUID;
ALTER TABLE budgets ADD COLUMN church_id UUID;
ALTER TABLE recurring_expenses ADD COLUMN church_id UUID;
ALTER TABLE sermons ADD COLUMN church_id UUID;
ALTER TABLE notifications ADD COLUMN church_id UUID;
ALTER TABLE audit_logs ADD COLUMN church_id UUID;

-- Backfill existing data to default church
UPDATE members SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE transactions SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE church_events SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE event_attendance SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE groups SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE group_members SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE communications SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE activities SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE budgets SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE recurring_expenses SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE sermons SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE notifications SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE audit_logs SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;

-- Make church_id NOT NULL after backfill
ALTER TABLE members ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE church_events ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE event_attendance ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE groups ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE group_members ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE communications ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE activities ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE recurring_expenses ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE sermons ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN church_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN church_id SET NOT NULL;

-- Update demo admin to link to church
-- admin@demo.church user id: ccd6aae9-23c8-4e45-a4c4-9d0959bcaeea
-- We need to update their app_metadata to include church_id
```

- Execute via Supabase Management API or pg connection

### Task 2: Church Context Provider

**Files:**
- Create: `src/lib/church-context.ts`

Church context that holds `activeChurchId`. For SUPER_ADMIN this is switchable via dropdown. For church users it's fixed from their auth metadata.

```typescript
import { createContext, useContext } from 'react';

interface ChurchContextType {
  activeChurchId: string | null;
  setActiveChurchId: (id: string | null) => void;
}

export const ChurchContext = createContext<ChurchContextType>({
  activeChurchId: null,
  setActiveChurchId: () => {},
});

export const useChurch = () => useContext(ChurchContext);
```

### Task 3: Update Data Fetching with Church Context

**Files:**
- Modify: `components/App.tsx`

Add church_id filter to all Supabase queries:
```typescript
const churchId = activeChurchId || currentUserChurchId;
// then in fetch: .eq('church_id', churchId)
```

### Task 4: Platform Nav + SUPER_ADMIN Views

**Files:**
- Create: `components/PlatformDashboard.tsx`
- Create: `components/TenantsList.tsx`
- Create: `components/TenantDetail.tsx`
- Create: `components/PlatformSettings.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `components/App.tsx`

PlatformDashboard — aggregated stats (total churches, total members, total revenue)
TenantsList — table of all churches with CRUD
TenantDetail — drill into a church's data
PlatformSettings — global feature flags, defaults

Sidebar — add "Platform" section visible only to SUPER_ADMIN
App.tsx — add route cases for platform views

### Task 5: Church Switching

**Files:**
- Modify: `components/Sidebar.tsx` — add church switch dropdown
- Modify: `components/App.tsx` — integrate ChurchContext

Church switch dropdown visible only to SUPER_ADMIN. Changes activeChurchId context, which triggers data refetch.

### Task 6: RLS Policies Migration

```sql
-- Enable RLS + policies on all tenant tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- ... for all tables

CREATE POLICY "tenant_isolation_members" ON members
  USING (church_id = (auth.jwt() ->> 'church_id')::uuid);
-- ... for each table
```

### Task 7: Invitations + Billing UI (MVP)

**Files:**
- Create: `components/InvitationsManager.tsx`
- Create: `components/BillingOverview.tsx`

Basic CRUD for invitations and invoice/subscription display.
