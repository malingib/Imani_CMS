# Sequential Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved roadmap one phase at a time in the root Vite app, moving from architecture stabilization through workflow integrity, platform readiness, and launch hardening.

**Architecture:** Keep the existing Supabase-first frontend architecture and continue extracting data access into focused `src/lib` services. Refactor large orchestration components incrementally, then layer in persisted workflow logic, tenant lifecycle improvements, and hardening work once the data boundaries are stable.

**Tech Stack:** React 19, TypeScript, Supabase JS, Vitest, Playwright, Vite

## Global Constraints

- Work only in the root Vite app unless a task explicitly touches docs or shared config
- Keep Supabase-first as the active backend direction; do not expand the Express backend path
- Use TDD for new services and workflow logic
- Preserve existing UI behavior unless the task is explicitly converting a mock flow into a real persisted flow
- Verify each phase with focused tests and `tsc --noEmit`

---

### Task 1: Phase 1A — Platform Service Extraction

**Files:**
- Create: `src/lib/platform-dashboard-service.ts`
- Create: `src/lib/tenants-service.ts`
- Create: `src/lib/billing-service.ts`
- Create: `src/lib/invitations-service.ts`
- Create: `src/lib/platform-settings-service.ts`
- Create: `src/lib/platform-services.test.ts`
- Modify: `components/PlatformDashboard.tsx`
- Modify: `components/TenantsList.tsx`
- Modify: `components/BillingOverview.tsx`
- Modify: `components/InvitationsManager.tsx`
- Modify: `components/PlatformSettings.tsx`

**Interfaces:**
- Produces: focused platform services for reads/writes now embedded in platform components
- Consumes: `supabase` client and existing component state/rendering

### Task 2: Phase 1B — App Shell Split

**Files:**
- Create: `src/lib/app-user.ts`
- Create: `src/lib/view-routing.ts`
- Create: `src/hooks/useToasts.ts`
- Create: `src/hooks/useAppSessionUser.ts`
- Create: `src/lib/app-shell.test.ts`
- Modify: `components/App.tsx`

**Interfaces:**
- Produces: smaller app-shell helpers for user mapping, view selection, and toasts
- Consumes: current `App.tsx` state shape and `src/lib/app-data.ts`

### Task 3: Phase 2A — Finance Workflow Persistence

**Files:**
- Create: `src/lib/finance-workflows.ts`
- Create: `src/lib/finance-workflows.test.ts`
- Modify: `components/FinanceReporting.tsx`
- Modify: `src/lib/persistence.ts`
- Modify: `types.ts`

**Interfaces:**
- Produces: persisted budgets and recurring expenses, typed workflow helpers, real mutation results
- Consumes: existing transaction persistence and finance UI contracts

### Task 4: Phase 2B — Communication and Notifications Persistence

**Files:**
- Create: `src/lib/communications-service.ts`
- Create: `src/lib/notifications-service.ts`
- Create: `src/lib/communications-service.test.ts`
- Modify: `components/CommunicationCenter.tsx`
- Modify: `components/NotificationsPanel.tsx`
- Modify: `components/App.tsx`
- Modify: `types.ts`

**Interfaces:**
- Produces: persisted communication logs and notifications state mutations
- Consumes: existing communication and notification UI props

### Task 5: Phase 3 — Tenant Lifecycle and Onboarding Readiness

**Files:**
- Create: `src/lib/tenant-onboarding-service.ts`
- Create: `src/lib/tenant-onboarding-service.test.ts`
- Modify: `components/TenantsList.tsx`
- Modify: `components/InvitationsManager.tsx`
- Modify: `components/BillingOverview.tsx`
- Modify: `src/lib/tenants-service.ts`
- Modify: `types.ts`

**Interfaces:**
- Produces: reliable tenant creation flow with church + subscription + invite orchestration
- Consumes: platform services extracted in Task 1

### Task 6: Phase 4 — Hardening, Docs, and Verification

**Files:**
- Modify: `services/geminiService.ts`
- Modify: `components/Login.tsx`
- Modify: `README.md`
- Modify: `.env.example` or create if missing
- Modify: `docs/launch-readiness-checklist.md`
- Create: `src/lib/mappers.test.ts`
- Create: `.github/workflows/ci.yml` (if repo uses GitHub Actions)

**Interfaces:**
- Produces: safer AI boundary, cleaned docs, expanded verification coverage, CI entrypoint
- Consumes: service boundaries from earlier phases
