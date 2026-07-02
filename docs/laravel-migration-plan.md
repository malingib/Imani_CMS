# Imani CMS — Laravel + React (Inertia) Migration Plan

**Status:** Approved direction — switch to Laravel React starter kit  
**Created:** 2026-07-01  
**Goal:** Full backend on Laravel; preserve Imani UI/UX pixel-for-pixel where it matters

---

## Executive summary

Migrate from **React SPA + Supabase** to **Laravel 13 + Inertia 3 + React 19** using the official React starter kit. UI components port almost 1:1 into `resources/js/pages/` and `resources/js/components/`. Laravel owns auth, tenancy, data, AI, and billing.

**Do not rewrite UI from scratch.** Port existing JSX, migrate Tailwind CDN tokens to `tailwind.config.js`, and only adopt shadcn/ui where it reduces code without changing the visual language.

**Estimated duration:** 10–14 weeks (1 full-time dev) or 6–8 weeks (2 devs, parallel phases)

---

## Target architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser — React 19 (Inertia pages, preserved Imani UI)     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Inertia (props, no REST API)
┌──────────────────────────▼──────────────────────────────────┐
│  Laravel 13                                                 │
│  ├── Fortify (auth, 2FA)                                    │
│  ├── Policies + Gates (replaces Supabase RLS)               │
│  ├── Eloquent models (church_id scoping)                    │
│  ├── Controllers → Inertia::render()                        │
│  ├── Laravel AI SDK (Gemini agents)                         │
│  ├── Cashier (Stripe billing)                               │
│  ├── Pennant (tier feature flags)                           │
│  └── Queues (Horizon) for long AI jobs                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  PostgreSQL (single DB, church_id tenancy — same as today)  │
└─────────────────────────────────────────────────────────────┘
                           │
                    Laravel Cloud (prod)
```

### Stack choices

| Concern | Choice | Why |
|---------|--------|-----|
| Frontend kit | `laravel new imani --react` | React 19 + Inertia 3 + shadcn/ui + TS |
| Tenancy | Single-DB `church_id` + global scopes | Matches existing schema; no Teams kit |
| SUPER_ADMIN | Custom middleware + policies | Starter-kit Teams ≠ church SaaS model |
| AI | `laravel/ai` (Gemini provider) | Replaces Supabase Edge Function |
| Billing | `laravel/cashier` | Stripe subscriptions |
| Feature tiers | `laravel/pennant` scoped to `Church` | basic/pro + kill switches |
| Dev AI | `laravel/boost` | MCP for Laravel-aware agents |
| Hosting | Laravel Cloud (Growth) | Queues, preview envs, Postgres |
| Maps | Keep Leaflet (CDN or npm) | DemographicsAnalysis |
| Charts | Keep recharts | Already used in 5 components |

### What we are NOT using

- Supabase (auth, RLS, edge functions) — fully replaced
- Starter-kit Teams feature — wrong tenancy model
- Vue / Livewire kits — staying on React
- `stancl/tenancy` multi-DB — overkill for MVP; revisit for enterprise tier

---

## UI/UX preservation contract

This is the non-negotiable design spec for every ported screen.

### Brand tokens (migrate from `index.html` CDN config)

```js
// tailwind.config.js — exact values from current app
colors: {
  brand: {
    primary: '#1E293B',   // navy
    indigo:  '#4F46E5',   // active nav
    gold:    '#FFB800',   // accent / error toasts
    emerald: '#10B981',
  }
}
fonts: {
  sans: ['DM Sans', 'Inter', 'system-ui'],
}
borderRadius: {
  'imani-sm': '1rem',      // rounded-2xl
  'imani-md': '2rem',      // rounded-[2rem]
  'imani-lg': '3rem',      // rounded-[3rem]
  'imani-xl': '3.5rem',    // rounded-[3.5rem]
}
```

### Pixel-perfect preserve list

| Element | File(s) | Rule |
|---------|---------|------|
| `ImaniLogoIcon` SVG | Sidebar, Login | Copy verbatim to `resources/js/components/brand/` |
| Login split layout | Login.tsx | Left brand panel + verse carousel unchanged |
| Page title rhythm | All pages | `text-4xl font-black uppercase` |
| Micro-labels | All pages | `text-[9px] font-black uppercase tracking-widest` |
| Sidebar | Sidebar.tsx | 256px fixed, church/branch switcher, role nav |
| Toast colors | App.tsx | success=navy, error=gold, info=indigo |
| Modal chrome | All modals | `rounded-[2rem]`–`rounded-[3.5rem]`, backdrop blur |
| MyGiving hero | MyGiving.tsx | Large navy stewardship card |
| Member slide-over | Membership.tsx | Full-screen panel with tabs |

### shadcn adoption rules

| Use shadcn | Keep custom |
|------------|-------------|
| Dialog, Sheet, AlertDialog | Login brand panel |
| Input, Select, Textarea, Switch | Toast stack (or sonner with brand variants) |
| DropdownMenu | Sidebar structure |
| Table (structure only) | Chart internals (recharts) |
| Tabs | Page title typography |
| Badge | ImaniLogoIcon |
| Popover (notifications) | Corner radius system |

**Override shadcn defaults** via `className` on every component — never accept default `rounded-lg` zinc theme.

### Visual regression gate

Before marking any phase done:

1. Screenshot current SPA screen (Playwright `toHaveScreenshot`)
2. Screenshot ported Inertia screen
3. Diff must pass or be explicitly approved

Store baselines in `e2e/screenshots/baseline/`.

---

## Route map (AppView → Laravel)

### Public

| Current AppView | Laravel route | Controller |
|-----------------|---------------|------------|
| Login | `GET/POST /login` | Fortify (custom Inertia views) |
| PRIVACY | `GET /privacy` | `LegalController@privacy` |
| COMPLIANCE | `GET /compliance` | `LegalController@compliance` |
| SECURITY | `GET /security` | `LegalController@security` |

### Platform (middleware: `super-admin`)

| AppView | Route | Controller |
|---------|-------|------------|
| PLATFORM_DASHBOARD | `GET /platform` | `Platform\DashboardController` |
| TENANTS | `GET /platform/tenants` | `Platform\TenantController@index` |
| INVITATIONS | `GET /platform/invitations` | `Platform\InvitationController@index` |
| BILLING (platform) | `GET /platform/billing` | `Platform\BillingController` |
| PLATFORM_SETTINGS | `GET /platform/settings` | `Platform\SettingsController` |

### Church-scoped (middleware: `auth`, `church.context`, `church.active`)

| AppView | Route | Roles | Controller |
|---------|-------|-------|------------|
| DASHBOARD | `GET /dashboard` | ADMIN,PASTOR,SUPER_ADMIN | `DashboardController` |
| MEMBERS | `GET /members` | ADMIN,PASTOR,SECRETARY | `MemberController` |
| FINANCE | `GET /finance` | ADMIN,TREASURER | `FinanceController` |
| EVENTS | `GET /events` | ADMIN,PASTOR,SECRETARY | `EventController` |
| COMMUNICATION | `GET /communication` | ADMIN,PASTOR,SECRETARY | `CommunicationController` |
| GROUPS | `GET /groups` | ADMIN,PASTOR | `GroupController` |
| REPORTS | `GET /reports` | ADMIN,PASTOR | `ReportController` |
| ANALYTICS | `GET /analytics` | ADMIN,PASTOR | `AnalyticsController` |
| SERMONS | `GET /sermons` | ADMIN,PASTOR | `SermonController` |
| AUDIT_LOGS | `GET /audit-logs` | ADMIN | `AuditLogController` |
| BILLING (church) | `GET /billing` | ADMIN | `BillingController` |
| SETTINGS | `GET /settings` | ADMIN,PASTOR,TREASURER | `SettingsController` |

### Member portal

| AppView | Route | Controller |
|---------|-------|------------|
| MY_PORTAL | `GET /portal` | `MemberPortalController` |
| MY_GIVING | `GET /giving` | `GivingController` |

### Church context for SUPER_ADMIN

When super-admin selects a church, set session `active_church_id`. Middleware `EnsureChurchContext` scopes queries. URL pattern: `/churches/{church}/dashboard` (optional — can use session-only like today).

---

## Database migration

Port `supabase/migrations/00001_domain_tables.sql` + `00002_multi_tenant.sql` to Laravel migrations.

### Changes during port

1. Add FK: `church_id → churches(id)` on all domain tables
2. Drop legacy `tenant_id` columns
3. Map Postgres enums → PHP enums (`MemberStatus`, `UserRole`, etc.)
4. Add `users` table (Laravel) with `role`, `church_id`, link to `members.user_id`
5. Seed: demo church from `supabase/seed.sql`

### Eloquent models (18 + 5 platform)

```
App\Models\
  User, Member, Transaction, ChurchEvent, EventAttendance,
  Group, GroupMember, Budget, RecurringExpense,
  Communication, Sermon, Activity, Notification, AuditLog,
  Church, Subscription, Invoice, Invitation, PlatformSetting
```

### Authorization (RLS → Policies)

| Supabase RLS rule | Laravel equivalent |
|-------------------|-------------------|
| `app_role() = 'SUPER_ADMIN'` | `Gate::before` or `SuperAdminPolicy` |
| `church_id = app_church_id()` | `BelongsToChurch` trait + global scope |
| Platform tables super-admin only | `PlatformPolicy` |

---

## AI migration (Gemini → Laravel AI SDK)

| Current function | Laravel agent class | Notes |
|------------------|---------------------|-------|
| `generateSermonOutline` | `App\Ai\Agents\SermonOutlineAgent` | Queue for long prompts |
| `getBibleScriptureAndReflection` | `BibleReflectionAgent` | Structured output: text + reflection |
| `generateShortInspirationalSermon` | `InspirationalMessageAgent` | |
| `generateDailyVerse` | `DailyVerseAgent` | Cache 30s per user |
| `scoutOutreachLocations` | `OutreachScoutAgent` | Drop empty `groundingChunks` or implement real |
| `analyzeFinances` | `FinanceAnalysisAgent` | `HasStructuredOutput` → `{summary, recommendations[]}` |

Controllers call agents; Inertia pages receive results as props or via `router.post` + flash.

---

## Phased execution plan

Each phase ends with: **working routes + visual regression pass + graphify update**.

### Phase 0 — Scaffold & design system (Week 1)

**Owner:** Main thread

```bash
laravel new imani-laravel --react
cd imani-laravel
composer require laravel/ai laravel/cashier laravel/pennant
composer require laravel/boost --dev
php artisan boost:install
```

Tasks:
- [ ] Create `imani-laravel/` directory (sibling or replace root — decide in kickoff)
- [ ] Port brand tokens to `tailwind.config.js`
- [ ] Add DM Sans + Inter fonts
- [ ] Copy `ImaniLogoIcon` to `resources/js/components/brand/`
- [ ] Port custom CSS: `.grid-pattern`, `.glass-card`, scrollbar styles
- [ ] Configure PostgreSQL in `.env`
- [ ] Set up Playwright in Laravel project (copy existing specs structure)

**Subagent:** `cavecrew-investigator` — locate all CDN Tailwind config in `index.html` for token extraction.

**Exit criteria:** Blank Laravel app with Imani colors, fonts, logo; `npm run dev` shows branded login placeholder.

---

### Phase 1 — Database & auth (Week 2)

Tasks:
- [ ] Laravel migrations from Supabase SQL (2 files → ~5 Laravel migrations)
- [ ] Eloquent models + enums + factories
- [ ] Extend Fortify: custom `LoginResponse` with role-based redirect
- [ ] User model: `role` enum, `church_id`, `member_id`
- [ ] Middleware: `EnsureSuperAdmin`, `EnsureChurchContext`, `EnsureRole`
- [ ] Policies for all models
- [ ] Seeders: demo church, admin user, sample members

**Subagents:**
- `cavecrew-investigator` — map every RLS policy to policy method
- `cavecrew-builder` — single model + policy pairs (1-2 files each)
- `cavecrew-reviewer` — audit policy coverage vs Supabase RLS

**Exit criteria:** Login works; role redirect matches current behavior; church scoping enforced.

---

### Phase 2 — App shell & layout (Week 3)

Port without changing visuals:
- [ ] `resources/js/layouts/AppLayout.tsx` ← Sidebar + header from App.tsx
- [ ] `resources/js/layouts/AuthLayout.tsx` ← Login split layout
- [ ] `resources/js/components/ToastProvider.tsx` ← custom toast stack
- [ ] `HandleInertiaRequests` shared props: `auth.user`, `activeChurch`, `churches`, `flash`
- [ ] Church switcher for SUPER_ADMIN (session-based)
- [ ] Branch switcher (hardcoded branches — same as today)

**Subagents:**
- `cavecrew-builder` — port Sidebar.tsx → `AppSidebar.tsx` (1 file)
- `cavecrew-builder` — port Login.tsx (1 file)
- Visual regression: Login + Sidebar screenshots

**Exit criteria:** Authenticated user sees identical sidebar/header; church switch works.

---

### Phase 3 — Core church modules (Weeks 4–5)

Port in order (each = controller + Inertia page + form requests + policy):

| Priority | Module | Source component | Persistence status |
|----------|--------|------------------|-------------------|
| P0 | Dashboard | Dashboard.tsx | Read aggregates |
| P0 | Members | Membership.tsx | ✅ exists in persistence.ts |
| P0 | Finance | FinanceReporting.tsx | ✅ transactions |
| P0 | Events | EventsManagement.tsx | ✅ events + attendance |
| P1 | Member portal | MemberPortal.tsx | Partial |
| P1 | My giving | MyGiving.tsx | No table (pledges) |

**Per module workflow (cavecrew chain):**
1. `cavecrew-investigator` — list props, handlers, Supabase calls in source component
2. Main thread — design controller + route
3. `cavecrew-builder` — port component JSX to `resources/js/pages/` (1 file)
4. `cavecrew-builder` — add controller (1 file)
5. `cavecrew-reviewer` — diff review
6. Playwright screenshot diff

**Exit criteria:** CRUD for members, transactions, events works; UI matches baseline.

---

### Phase 4 — Communication, groups, reports (Week 6)

| Module | Source | Notes |
|--------|--------|-------|
| Communication | CommunicationCenter.tsx | Add `communications` persistence |
| Groups | GroupsManagement.tsx | Wire to `groups` + `group_members` (fix text[] mismatch) |
| Reports | ReportsCenter.tsx | + AI finance insight |
| Analytics | DemographicsAnalysis.tsx | Keep Leaflet + recharts |
| Sermons | SermonHistory.tsx + AISermonAssistant.tsx | **Fix orphaned routes** |
| Audit logs | AuditLogs.tsx | Read-only |

**Exit criteria:** All admin sidebar items routed; SERMONS no longer falls through to Dashboard.

---

### Phase 5 — AI layer (Week 7)

- [ ] `composer require laravel/ai`
- [ ] Configure Gemini provider
- [ ] Port 6 agents from `geminiService.ts`
- [ ] Controller endpoints or inline controller calls
- [ ] Queue long-running sermon generation
- [ ] Feature tests with `Agent::fake()`

**Subagent:** `cavecrew-investigator` — trace all `geminiService` imports across components.

**Exit criteria:** All 6 AI features work; no client-side API keys.

---

### Phase 6 — Platform admin (Week 8)

| Module | Source |
|--------|--------|
| Platform dashboard | PlatformDashboard.tsx |
| Tenants | TenantsList.tsx |
| Invitations | InvitationsManager.tsx |
| Platform billing | BillingOverview.tsx |
| Platform settings | PlatformSettings.tsx |
| Church billing | Billing.tsx |

**Exit criteria:** SUPER_ADMIN platform flow matches current E2E specs.

---

### Phase 7 — Billing & integrations (Week 9)

- [ ] Cashier + Stripe webhooks
- [ ] Map `subscriptions` + `invoices` tables to Cashier or hybrid
- [ ] Pennant: `basic` vs `pro` feature gates
- [ ] Settings integrations tab (stubs OK for MVP)

---

### Phase 8 — Testing & cutover (Weeks 10–11)

- [ ] Port Playwright specs (update selectors for Inertia DOM)
- [ ] Add E2E: member CRUD, finance CRUD, role gating
- [ ] PHPUnit/Pest: policy tests, agent tests
- [ ] Laravel Boost MCP verified in Cursor
- [ ] `graphify update .` on new codebase
- [ ] Production deploy to Laravel Cloud
- [ ] DNS cutover
- [ ] Archive `components/`, `supabase/`, old SPA entry

**Subagent:** `cavecrew-reviewer` — full migration diff review before cutover.

---

## Subagent delegation playbook

Use **cavecrew** for context-efficient work (per `cavecrew` skill).

| Situation | Agent | Prompt template |
|-----------|-------|-----------------|
| Find all usages before port | `cavecrew-investigator` | "Locate all imports/calls of X in imani-cms" |
| Port single component | `cavecrew-builder` | "Port Membership.tsx to resources/js/pages/Members/Index.tsx — preserve JSX/classes exactly" |
| Port single controller | `cavecrew-builder` | "Create MemberController@index matching Membership props" |
| Review phase diff | `cavecrew-reviewer` | "Review Phase 3 member module diff" |
| Broad architecture question | `graphify query` | "How does member CRUD flow work?" |
| 3+ file refactor | Main thread | Builder returns `too-big` — don't chain |
| Parallel scout | 2-3 investigators | One for UI, one for data, one for tests |

### Per-session workflow

```
1. graphify query "<module>"           # orient
2. cavecrew-investigator             # locate
3. main thread: controller + route   # design
4. cavecrew-builder (component)      # port UI
5. cavecrew-builder (controller)     # wire data
6. cavecrew-reviewer                 # audit
7. Playwright screenshot diff        # UX gate
8. graphify update .                 # refresh graph
```

---

## Parallel workstreams (2 devs)

| Dev A (backend) | Dev B (frontend) |
|-----------------|------------------|
| Phase 1 migrations + policies | Phase 0 design tokens + layout |
| Controllers + form requests | Component ports (Phase 3–4) |
| AI agents (Phase 5) | Visual regression baselines |
| Cashier (Phase 7) | Playwright updates (Phase 8) |

Sync daily on shared props interface (TypeScript types in `resources/js/types/`).

---

## Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| shadcn overrides break brand look | High | Visual regression gate every phase; custom radius tokens |
| Inertia prop drift | Medium | Shared TS types; `cavecrew-reviewer` on controller-page pairs |
| Groups data model mismatch | Medium | Phase 4 explicitly migrates `members.groups[]` → `group_members` |
| 3–5 month scope creep | High | Phase gates; ship P0 modules before P1 |
| Lost SUPER_ADMIN church switch | High | Port church-context logic in Phase 2 before features |
| Stripe billing complexity | Medium | Phase 7 optional for MVP; display-only billing OK initially |

---

## File structure (target)

```
imani-laravel/
├── app/
│   ├── Ai/Agents/           # 6 Gemini agents
│   ├── Enums/               # MemberStatus, UserRole, etc.
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Platform/    # Super-admin
│   │   │   └── ...          # Church-scoped
│   │   ├── Middleware/
│   │   │   ├── EnsureSuperAdmin.php
│   │   │   ├── EnsureChurchContext.php
│   │   │   └── EnsureRole.php
│   │   └── Requests/
│   ├── Models/              # 18 Eloquent models
│   └── Policies/
├── database/migrations/     # Ported from Supabase
├── resources/js/
│   ├── components/
│   │   ├── brand/           # ImaniLogoIcon, etc.
│   │   └── ui/              # shadcn (overridden)
│   ├── layouts/             # AppLayout, AuthLayout
│   ├── pages/               # Inertia pages (ported from components/)
│   └── types/               # Domain TS types (from types.ts)
├── tests/
│   ├── Feature/
│   └── Browser/             # Playwright
└── e2e/screenshots/baseline/
```

---

## Immediate next steps (this week)

1. **Decision:** Scaffold `imani-laravel/` as sibling directory vs replace repo root
2. **Phase 0 kickoff:** Run `laravel new imani-laravel --react`
3. **Extract design tokens:** `cavecrew-investigator` on `index.html` Tailwind config
4. **Port ImaniLogoIcon + Login layout** as first visual proof
5. **Create Laravel migrations** from existing Supabase SQL

---

## Success criteria

- [ ] Every `AppView` has a working Laravel route
- [ ] Role gating matches Sidebar visibility matrix
- [ ] Visual regression passes for Login, Sidebar, Dashboard, Members, Finance
- [ ] No Supabase dependency in production
- [ ] AI features work via Laravel AI SDK
- [ ] SUPER_ADMIN platform flow passes ported Playwright specs
- [ ] `laravel/boost` MCP active for ongoing development
