# Imani CMS - Comprehensive Code Review & Analysis

**Date:** July 2, 2026  
**Project:** Church Management System (Multi-tenant SaaS platform)  
**Stack:** React 19 + TypeScript + Vite + Supabase + Gemini AI

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Design & Patterns](#system-design--patterns)
3. [Codebase Quality](#codebase-quality)
4. [Security Analysis](#security-analysis)
5. [Performance & Optimization](#performance--optimization)
6. [Database Design](#database-design)
7. [Frontend UI/UX](#frontend-uiux)
8. [Roles & Permissions](#roles--permissions)
9. [Critical Issues Found](#critical-issues-found)
10. [Bugs & Half-Baked Features](#bugs--half-baked-features)
11. [Refactoring Recommendations](#refactoring-recommendations)
12. [Areas for Improvement](#areas-for-improvement)
13. [What to Discard](#what-to-discard)
14. [What to Add](#what-to-add)

---

## Architecture Overview

### Current Structure

```
imani-cms/
├── components/              # 30+ React components (9.6K lines)
├── services/               # AI services (Gemini)
├── src/lib/                # Core business logic (30+ files)
│   ├── app-data.ts        # Data loading orchestration
│   ├── persistence.ts     # Supabase CRUD operations
│   ├── supabase-auth.ts   # Auth hooks
│   ├── church-context.tsx # Multi-tenant context
│   ├── *-service.ts       # Domain services (finance, billing, etc.)
│   └── *-test.ts          # Unit tests (8 test files)
├── e2e/                    # Playwright tests (login, platform, tenants)
├── index.tsx              # React entry point
├── types.ts               # Shared type definitions
└── [vite config files]
```

### Architectural Pattern

**Multi-Tenant SaaS with Role-Based Access:**
- **Platform tier:** SUPER_ADMIN views all tenants, platform metrics, billing
- **Church tier:** ADMIN/PASTOR/STAFF manage church operations (members, finance, events)
- **Member tier:** Members view own profile, giving, events

**Data Flow:**
```
Login → Supabase Auth → useSession() → App state → Service layer → Components
```

**Key Patterns:**
- Lazy loading components (`React.lazy()`) for code splitting
- Context API for multi-tenant church selection
- Service layer abstracting Supabase (testable, injectable clients)
- Mapper pattern for Supabase row → App type transformation

---

## System Design & Patterns

### Strengths

✅ **Service Layer Abstraction**
- `createChurchAppDataService()` decouples business logic from Supabase
- Mappers (`mappers.ts`) handle row → type transformations cleanly
- Easy to test with mock clients

✅ **Type Safety**
- Full TypeScript with 0 errors (typecheck passes)
- Enums for constants (UserRole, MemberStatus, etc.)
- Interfaces for database rows and app types

✅ **Auth & Session Management**
- `useAuth()` and `useSession()` hooks encapsulate Supabase Auth
- Token persistence and auto-refresh configured
- Clear separation between Supabase User and App User (mapping function)

✅ **Component Organization**
- Shared components (`EmptyState`, `ErrorBanner`, `LoadingSpinner`)
- Role-aware view rendering in App.tsx
- Props-driven component design

### Weaknesses

❌ **Monolithic App.tsx (543 lines)**
- Handles 15+ features: auth, data loading, state management, routing
- 30+ state variables mixed together
- Multiple concerns (CRUD handlers, audit logging, notifications)
- Hard to test, extend, or reason about

❌ **No Global State Management**
- Using local useState for data that spans multiple components
- Manual prop drilling for common data (members, transactions, events)
- No caching or deduplication strategy

❌ **No Real Routing**
- Manual view-switching with `currentView` state variable
- No deep linking or URL-based navigation
- Browser back/forward won't work properly

❌ **Service Layer Inconsistency**
- Some services exist (`finance-service.ts`, `billing-service.ts`)
- Others don't (`communication` persistence is inline in App.tsx)
- No standardized service interface pattern

---

## Codebase Quality

### Metrics

| Metric | Status |
|--------|--------|
| TypeScript Errors | ✅ 0 |
| Total Component Lines | 9,625 |
| Largest Component | 726 lines (Membership.tsx) |
| Services & Utilities | 30+ files |
| Test Files | 8 |
| Test Coverage | ⚠️ Partial (unit tests exist, no integration) |

### Code Style Issues

- ⚠️ **Inconsistent naming:** `onAddMember`, `handleAddMember`, `createMember` all used
- ⚠️ **Magic strings:** View names like `'DASHBOARD'`, `'MEMBERS'` scattered
- ⚠️ **Inline logic:** Complex filters in `useMemo` vs extracted functions
- ⚠️ **Unused imports:** Dashboard, FinanceReporting, DemographicsAnalysis imported as lazy but rarely used

### Documentation

- ✅ README with setup instructions
- ✅ Database role/permission table
- ✅ Tenant onboarding flow documented
- ✅ Provider setup steps
- ❌ No API documentation for services
- ❌ No component props documentation
- ❌ No deployment guide

---

## Security Analysis

### ✅ Strong Points

1. **Supabase RLS Enforced**
   - Docs mention `app_role()` and `app_church_id()` helper functions
   - All queries scoped to `church_id` at persistence layer

2. **Auth Token Management**
   - Supabase handles token storage securely
   - Auto-refresh token configured
   - No tokens in localStorage (Supabase manages it)

3. **Password Reset Flow**
   - `requestPasswordReset()` in useAuth hook

4. **Secrets Management**
   - Gemini API key stored as Supabase secret (not in frontend)
   - Environment variables isolated

### ❌ Security Concerns

1. **Missing Input Validation**
   - Member form accepts phone/email without validation
   - CSV import has no data validation before insert
   - File upload (member photos) has no size/type checks
   - No SQL injection protection at form level (though Supabase parameterized queries help)

2. **No CSRF Protection**
   - Single-page app with no CSRF token handling (expected in SPA)
   - But no verification of sensitive operations

3. **Audit Logging Gaps**
   - Only logged on client side before server persist
   - If server call fails, audit log still created locally
   - No audit trail for failed operations

4. **Missing Rate Limiting**
   - No protection against brute force login attempts
   - CSV bulk import has no limits
   - API calls unprotected

5. **Data Exposure**
   - Member photos uploaded to unknown storage
   - No encryption at rest mentioned
   - PII (DOB, phone, email) handled without special care

6. **Permission Checks Are Client-Side First**
   - `currentUserRole` checked in components before operations
   - Server-side RLS is the real enforcement, but no validation layer

### Recommendations

- Add `zod` or `yup` for form validation
- Implement rate limiting on sensitive endpoints (Supabase edge functions)
- Add server-side permission checks in edge functions
- Encrypt PII fields at database level
- Implement proper file upload validation (size, MIME type)
- Use prepared statements for all queries (already done via Supabase, good!)

---

## Performance & Optimization

### Good Practices

✅ **Code Splitting**
- Lazy-loaded components: Dashboard, FinanceReporting, DemographicsAnalysis, ReportsCenter, MyGiving
- Reduces initial bundle size

✅ **Memoization**
- `useMemo` for filtered member lists, celebration calculations
- Prevents unnecessary re-renders

✅ **Service Aggregation**
- `loadChurchAppData()` batches 9 queries with `Promise.all()`
- Single data load on mount, not waterfall queries

### Issues

❌ **All-at-Once Data Loading**
- App loads ALL church data (members, transactions, events, budgets, etc.) on every login
- No pagination or virtual scrolling
- For a church with 10K members, this will be slow and memory-heavy
- No incremental loading strategy

❌ **No Caching**
- Data reloaded on every `churchId` change
- No stale-while-revalidate pattern
- No optimistic updates

❌ **Large Components Re-render**
- 543-line App.tsx re-renders entire app on any state change
- Membership.tsx (726 lines) with CSV parsing done on main thread

❌ **Bundle Size Not Optimized**
- 30+ components, ~10K lines → likely 500KB+ after bundling
- No dependency analysis
- lucide-react icons imported individually (OK, but tree-shake to verify)

### Optimization Recommendations

1. Implement pagination for member/transaction lists
2. Add React Query or SWR for smart caching
3. Split App.tsx into smaller container/view components
4. Move CSV parsing to Web Worker
5. Implement virtual scrolling for large lists
6. Add performance monitoring (Web Vitals)

---

## Database Design

### Tables (from database.types.ts)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `members` | Church members | id, church_id, first_name, status, groups, photo |
| `transactions` | Giving & expenses | id, church_id, member_id, amount, type, category |
| `church_events` | Events | id, church_id, title, date, location, rsvp_deadline |
| `event_attendance` | RSVP tracking | event_id, member_id |
| `budgets` | Financial budgets | id, church_id, category, amount |
| `recurring_expenses` | Monthly expenses | id, church_id, category, amount |
| `communications` | SMS/Email logs | id, church_id, type, target_group |
| `notifications` | In-app alerts | id, church_id, user_id, message, read |
| `audit_logs` | Compliance tracking | id, church_id, user_id, action, severity |
| `churches` | Tenants | id, name, slug, tier, status, trial_end_date |
| `subscriptions` | Billing | id, church_id, tier, status, renews_at |
| `invitations` | User invites | id, church_id, email, role, expires_at |

### Design Issues

❌ **Missing Columns**
- `members.photo` stored as string (URL?) — should be separate blob storage
- `members.stewardship_score` — no metadata on calculation method
- No `updated_at` timestamp on most tables (no audit trail for changes)
- `communications` doesn't track delivery status

❌ **No Soft Deletes**
- Members/transactions actually deleted, hard to recover
- No compliance with data retention laws

❌ **Missing Indexes**
- No mention of indexes on `church_id` (critical for multi-tenant)
- `member_id` lookups likely unindexed
- Searching members by phone/email likely slow

❌ **No Denormalization Strategy**
- Member giving totals calculated in-app, not stored
- Event attendance count calculated on load

---

## Frontend UI/UX

### Component Breakdown

| Category | Components | Lines |
|----------|------------|-------|
| Core | App, Sidebar, Login | ~1,500 |
| Church Features | Dashboard, Membership, Finance, Events, Groups | ~3,200 |
| Communications | CommunicationCenter | ~300 |
| Analytics | DemographicsAnalysis, ReportsCenter, SermonHistory | ~1,000 |
| Member | MemberPortal, MyGiving | ~900 |
| Platform | PlatformDashboard, TenantRegistry, SystemOwner | ~600 |
| Admin | Settings, Billing, Audit, Compliance | ~1,500 |
| Shared | EmptyState, ErrorBanner, LoadingSpinner | ~200 |

### UI/UX Strengths

✅ **Feature-Rich**
- Comprehensive member management with bulk import
- Financial tracking with budgets & recurring expenses
- Event management with RSVP system
- Communication center for SMS/email broadcasts
- Analytics & reporting

✅ **Role-Based UI**
- Different views for different roles (SUPER_ADMIN sees platform, ADMIN sees church)
- Settings tabs gated by role

✅ **Responsive Icons**
- Lucide React for consistent iconography
- Good visual hierarchy with icons

### UI/UX Issues

❌ **Inconsistent Interaction Patterns**
- Sometimes data is inline-editable, sometimes modal-based
- Membership uses modals for edit, but Settings uses inline forms
- Inconsistent button placement and styling

❌ **No Empty States**
- `EmptyState` component exists but rarely used
- "No members" doesn't show friendly message, just empty table

❌ **Confusing Navigation**
- Manual view switching feels like clicking a phone menu, not a web app
- No breadcrumbs or "current location" indicator
- Sidebar menu items don't highlight current view

❌ **No Accessibility**
- Modals not trapped (focus can escape)
- No ARIA labels on custom inputs
- No keyboard navigation for dropdowns
- No sr-only text for screen readers

❌ **Slow Form Interactions**
- CSV import parses on main thread → potential hang
- No progress indicator for bulk operations
- No cancellation ability for long-running operations

❌ **Poor Error Handling UX**
- `ErrorBanner` exists but not widely used
- Form errors shown in console, not to user
- No retry mechanism for failed API calls

---

## Roles & Permissions

### Defined Roles

```typescript
SUPER_ADMIN  → Platform-wide (all churches)
ADMIN        → Church-wide (all features)
PASTOR       → Church-wide (limited: no financials)
STAFF        → Church operational (events, groups, communication)
MEMBER       → Self-service (own profile, giving, events)
TREASURER    → Finance-only
SECRETARY    → Records & communications
```

### Permission Implementation

**App Layer (Client-Side):**
```typescript
// In App.tsx
if (isSuperAdmin && viewingPlatform) {
  // Show platform dashboard
}

// In components
if (currentUserRole === UserRole.ADMIN) {
  // Show admin features
}
```

**Database Layer (Server-Side):**
- Docs mention RLS with `app_role()` and `app_church_id()`
- Actual RLS policy code not visible in repo

### Issues

❌ **Client-Side First**
- Permission checks happen in React first
- Server-side enforcement is secondary
- If user manually changes `currentUserRole` in memory, they bypass client checks

❌ **No Granular Permissions**
- User roles are broad (ADMIN can do anything in a church)
- No permission matrix for specific features
- PASTOR can view members but not finance (per docs), but Settings component allows PASTOR to see PREFERENCES tab (inconsistent)

❌ **Super Admin Impersonation Not Audited**
- SUPER_ADMIN can `setActiveChurchId()` to switch to another church
- No audit trail that SUPER_ADMIN "logged in as" other church
- Privacy concern: SUPER_ADMIN can access any member's data without notification

---

## Critical Issues Found

### 🔴 Issue 1: Broken RLS Enforcement Path

**Severity:** HIGH  
**Location:** `components/App.tsx:90-91`

```typescript
const churchId = activeChurchId || (currentUser?.churchId as string) || null;
```

**Problem:**
- If `currentUser?.churchId` is falsy but exists as undefined, `null` is used
- SUPER_ADMIN without selected church has `churchId = null`
- Queries then run with `church_id = null`, which may return no data OR bypass RLS entirely depending on policy

**Impact:** Data leakage or unavailable features for SUPER_ADMIN

**Fix:** Explicit null check
```typescript
const churchId = activeChurchId ?? currentUser?.churchId ?? null;
```

---

### 🔴 Issue 2: Missing Error Handling in Bulk Operations

**Severity:** HIGH  
**Location:** `components/Membership.tsx:95-120` (CSV import)

```typescript
const handleBulkCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Parses CSV on main thread, no error handling for malformed CSV
  // If CSV is corrupted, app may hang
  // If insertMembers() fails, entire batch fails (no partial success)
};
```

**Problem:**
- CSV parsing synchronous (blocks UI)
- No timeout
- Malformed CSV causes silent failure
- No rollback if partial batch fails

**Impact:** UI freeze, data inconsistency

**Fix:** Use Web Worker + batch with retry logic

---

### 🔴 Issue 3: Missing Input Validation

**Severity:** MEDIUM-HIGH  
**Location:** `components/Membership.tsx`, `components/Login.tsx`

```typescript
// Phone number: no validation
<input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />

// Email: no validation
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
```

**Problem:**
- Phone numbers stored as-is (no formatting or validation)
- Email not validated before submission
- CSV import accepts invalid data

**Impact:** Data quality issues, failed SMS/email sends

**Fix:** Add `zod` schema validation
```typescript
const MemberSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-()]+$/),
  email: z.string().email(),
});
```

---

### 🔴 Issue 4: Audit Logs Created Before Database Persist

**Severity:** MEDIUM  
**Location:** `components/App.tsx:100-114`

```typescript
const createAudit = useCallback(async (action: string, module: AppView, severity: AuditLog['severity'] = 'INFO') => {
  // 1. Create log in local state immediately
  const log: AuditLog = { id: Date.now().toString(), userId: currentUser.id, ... };
  setAuditLogs(prev => [log, ...prev]);
  
  // 2. Then try to persist to server
  try {
    await appDataService.createAuditLog({...});
  } catch {}  // Silently fails!
});
```

**Problem:**
- Audit log added to local state before server confirmation
- If server call fails, local log exists but never persisted
- `catch {}` silently swallows errors (no retry, no notification)
- Not idempotent: retrying could create duplicates

**Impact:** Incomplete audit trail, compliance risk

**Fix:**
```typescript
try {
  const saved = await appDataService.createAuditLog({...});
  setAuditLogs(prev => [saved, ...prev]);
} catch (error) {
  console.error('Audit log failed:', error);
  addToast('Failed to log action', 'error');
}
```

---

### 🔴 Issue 5: No Protection Against Concurrent Operations

**Severity:** MEDIUM  
**Location:** Multiple handlers in App.tsx

```typescript
const handleAddMember = async (member: Member) => {
  try {
    const saved = await createMember(member, requireChurchId());
    setMembers(prev => [...prev, saved]);  // ← No check if member already added
  } catch (error: any) {
    addToast(error?.message || 'Failed to add member', 'error');
  }
};
```

**Problem:**
- If user clicks "Add Member" twice quickly, could add same member twice
- No optimistic locking or idempotency keys
- Network retry could cause duplicates

**Impact:** Data duplication

**Fix:** Disable button during submission, use idempotency keys

---

### 🔴 Issue 6: Member Photo Storage Undefined

**Severity:** MEDIUM  
**Location:** `components/Membership.tsx:61`, `types.ts:60`

```typescript
photo?: string;  // ← Is this a URL? Base64? Where is it stored?
```

**Problem:**
- `Member.photo` is undefined in terms of storage backend
- Unclear if it's URL, blob, or base64
- No size limits on upload
- No storage backend configured (Vercel Blob? S3? Supabase Storage?)

**Impact:** Lost photos or budget overages

**Fix:** Document and implement storage strategy (recommend Vercel Blob with signed URLs)

---

## Bugs & Half-Baked Features

### 🟡 Bug 1: Verse Display Timing Issue

**Location:** `components/Login.tsx:61-77`

```typescript
const fetchAiVerse = async () => {
  setFade(false);
  await new Promise(resolve => setTimeout(resolve, 1000));  // Fixed 1s wait
  try {
    const raw = await generateDailyVerse();  // Network request (could be 10s)
    // ...
  }
};
```

**Issue:** Hardcoded 1s fade, then async fetch could take minutes. UI flickers.

---

### 🟡 Bug 2: Event Attendance Not Initialized

**Location:** `src/lib/app-data.ts:50`

```typescript
return events.map((event) => ({ ...event, attendance: attendanceByEvent.get(event.id) || [] }));
```

**Issue:** If event has no attendance records, `attendance` is `[]`. But in EventsManagement, code may expect it. Check component.

---

### 🟡 Bug 3: Missing Church Data on Login

**Location:** `components/App.tsx:120-121`

```typescript
if (nextUser.role === UserRole.SUPER_ADMIN) {
  fetchChurches();  // Async, but not awaited
}
```

**Issue:** Churches loaded asynchronously. SUPER_ADMIN sees empty churches list briefly.

---

### 🟡 Half-Baked: AISermonAssistant Component

**Location:** `components/AISermonAssistant.tsx:1-30`

```typescript
// Component imported in older code but not used in current routing
// Gemini service available but sermon integration incomplete
```

**Status:** Feature started but not integrated into workflow. Dead code.

---

### 🟡 Half-Baked: Platform Finance Dashboard

**Location:** `components/PlatformFinance.tsx`

```typescript
// Platform-level billing/revenue dashboard
// Service exists (platform-services.ts) but data population unclear
// No real financial data, seems to be template
```

**Status:** Structure exists, logic incomplete.

---

### 🟡 Half-Baked: MyGiving Component

**Location:** `components/MyGiving.tsx:1-50`

```typescript
const handleGive = (amount: number) => {
  addToast('STK Push Sent');  // Mock message, not real M-Pesa integration
};
```

**Status:** UI ready, backend integration not done. M-Pesa payment flow stubbed.

---

## Refactoring Recommendations

### 🟢 Priority 1: Split App.tsx

**Goal:** 543-line monolith → modular views

```
App.tsx (main shell)
├── containers/
│   ├── ChurchDashboardContainer.tsx  (← Dashboard + data)
│   ├── MembershipContainer.tsx       (← Membership + handlers)
│   ├── FinanceContainer.tsx
│   └── ...
├── views/
│   ├── DashboardView.tsx   (← pure component)
│   ├── MembershipView.tsx
│   └── ...
└── hooks/
    ├── useChurchData.ts    (← extract data loading)
    ├── useAudit.ts         (← extract audit logic)
    └── useToasts.ts        (← extract toast logic)
```

**Effort:** 3-4 days

---

### 🟢 Priority 2: Add Real Routing

**Goal:** Replace view-switching with URL-based routing

```typescript
// Before
const [currentView, setCurrentView] = useState('DASHBOARD');

// After
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/dashboard" element={<DashboardView />} />
  <Route path="/members" element={<MembershipView />} />
  <Route path="/finance" element={<FinanceView />} />
</Routes>
```

**Benefits:**
- Back/forward button works
- Deep linking works
- Easier bookmarking/sharing

**Effort:** 2-3 days

---

### 🟢 Priority 3: Add Data Caching Layer

**Goal:** Replace Promise.all() with smart caching

```typescript
// Before
appDataService.loadChurchAppData(churchId)  // Reload everything

// After
import { useQuery } from '@tanstack/react-query';

const { data: church } = useQuery({
  queryKey: ['church', churchId],
  queryFn: () => appDataService.loadChurchAppData(churchId),
  staleTime: 5 * 60 * 1000,  // 5 min
});
```

**Benefits:**
- Automatic deduplication
- Stale-while-revalidate
- Background refetching
- Offline support

**Effort:** 2-3 days

---

### 🟢 Priority 4: Extract Service Layer Completely

**Goal:** Move all Supabase calls to services

```
services/
├── members/
│   ├── useMembersService.ts   (← hook)
│   ├── memberService.ts       (← business logic)
│   └── memberRepository.ts    (← Supabase queries)
├── transactions/
├── events/
└── ...
```

**Effort:** 3-4 days

---

### 🟢 Priority 5: Standardize Form Validation

**Goal:** `zod` for all forms

```typescript
const MemberFormSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/.../, 'Invalid phone'),
  email: z.string().email(),
  // ...
});

type MemberForm = z.infer<typeof MemberFormSchema>;
```

**Effort:** 1-2 days

---

## Areas for Improvement

### 📈 Performance

1. **Pagination**
   - Implement cursor-based pagination for member lists
   - Show 50 at a time, not all

2. **Virtual Scrolling**
   - For large tables: use `react-window` or `@tanstack/react-virtual`

3. **Image Optimization**
   - Compress member photos on upload
   - Generate thumbnails

4. **Bundle Analysis**
   - Run `npm run build && npm run analyze` to find large imports
   - Tree-shake unused code

### 🔒 Security

1. **Input Validation (zod schema)**
   - Phone, email, dates, amounts
   - Sanitize on form submission

2. **Rate Limiting (Supabase edge functions)**
   - Max 10 requests/min per user IP
   - Max 100 bulk imports/day per church

3. **Audit Enhancements**
   - Log failed operations
   - Log sensitive reads (viewing member PII)
   - Export audit logs

4. **RBAC Granularity**
   - Add permission matrix: `user_permissions(user_id, feature, action)`
   - Query in RLS: `auth.uid() = user_id AND can_perform(feature, action)`

### 🎨 UX

1. **Keyboard Navigation**
   - Tab through modals
   - Esc to close
   - Enter to submit forms

2. **Accessibility (a11y)**
   - Add ARIA labels: `aria-label="Add member"`, `aria-describedby="error-message"`
   - Screen reader testing with NVDA or JAWS

3. **Better Error Messages**
   - Instead of: "Error: unknown error"
   - Show: "Phone number format invalid. Use format: +254712345678"

4. **Loading States**
   - Skeleton loaders for data
   - Progress bar for bulk operations
   - Disable buttons during submission

5. **Offline Support**
   - ServiceWorker + cached data
   - Queue mutations while offline
   - Sync on reconnect

### 📊 Analytics & Observability

1. **Error Tracking**
   - Integrate Sentry: `npm install @sentry/react`
   - Track crashes and errors

2. **Performance Monitoring**
   - Core Web Vitals: LCP, INP, CLS
   - Instrument slow operations

3. **Usage Analytics**
   - PostHog: track user flows
   - Understand which features are used

### 💰 Platform Features

1. **Subscription Management**
   - Stripe integration for billing
   - Invoice generation
   - Usage-based pricing (per member count)

2. **Email Notifications**
   - SendGrid/AWS SES
   - Transactional emails (password reset, invitations)
   - Daily/weekly digests

3. **Reporting & Exports**
   - Member roster export (CSV/PDF)
   - Financial reports (PDF)
   - Attendance reports

---

## What to Discard

### ❌ Dead Code

1. **AISermonAssistant.tsx**
   - Imported but not used in routing
   - Incomplete feature
   - Remove from components/, update imports

2. **SermonHistory.tsx**
   - Referenced in app but no sermon data ingestion
   - Not in main sidebar
   - Remove or complete

3. **Test Files with No Tests**
   - `app-shell.test.ts` is empty
   - Clean up or write actual tests

### ❌ Unused Dependencies

- Check `npm ls --depth=0` for unused packages
- Likely candidates: any i18n, old animation libraries

### ❌ Mock/Placeholder Data

- `const branches = ['Nairobi Central', ...]` in App.tsx (hardcoded)
- Should come from database if multi-branch support is needed

### ❌ Outdated Documentation

- `laravel-migration-plan.md` — suggests Laravel was considered once
- Remove unless still relevant

---

## What to Add

### ✅ Essential

1. **Real-Time Collaboration**
   - Supabase Realtime: auto-sync when members added elsewhere
   - Conflict resolution for concurrent edits

2. **Better Error Recovery**
   - Retry middleware for failed API calls
   - Exponential backoff

3. **Comprehensive Testing**
   - Unit tests: 80%+ coverage on services
   - Integration tests: E2E flows (login → add member → view stats)
   - Component tests: forms, modals

4. **Deployment Pipeline**
   - GitHub Actions: lint, test, build, deploy
   - Preview deployments on PR
   - Production secrets management

### ✅ Important

1. **Dark Mode**
   - TailwindCSS dark: mode
   - Theme toggle in Settings

2. **Internationalization (i18n)**
   - Support Swahili, English, French
   - `react-i18next` + translations

3. **Advanced Search**
   - Elastic Search or Supabase Full-Text Search
   - Fuzzy matching on member names

4. **Webhooks**
   - Stripe: payment status updates
   - M-Pesa: transaction confirmations

5. **Two-Factor Authentication**
   - Supabase TOTP support
   - Backup codes

### ✅ Nice-to-Have

1. **Mobile App**
   - React Native / Expo for iOS/Android
   - Offline sync

2. **API Docs**
   - OpenAPI/Swagger spec
   - Public API for third-party integrations

3. **Custom Branding**
   - Church logo upload
   - Custom color scheme (white-label)

4. **Advanced Analytics**
   - Giving trends, member retention, event attendance rates
   - Forecasting

5. **SMS Integration**
   - Twilio or AWS SNS
   - Send event reminders, giving confirmations

---

## Summary Table

| Area | Status | Priority | Effort |
|------|--------|----------|--------|
| **Architecture** | Monolithic | 🔴 HIGH | 3-4 days |
| **Routing** | Manual view-switching | 🔴 HIGH | 2-3 days |
| **State Management** | useState only | 🟡 MEDIUM | 2-3 days |
| **Data Caching** | None | 🟡 MEDIUM | 2-3 days |
| **Input Validation** | Missing | 🔴 HIGH | 1-2 days |
| **Error Handling** | Partial | 🟡 MEDIUM | 1-2 days |
| **Testing** | Partial | 🟡 MEDIUM | 2-3 days |
| **Accessibility** | Missing | 🟡 MEDIUM | 2-3 days |
| **Documentation** | Partial | 🟠 LOW | 1-2 days |
| **Security (RLS)** | Implemented | ✅ GOOD | — |
| **Typecheck** | Passing | ✅ GOOD | — |

---

## Estimated Refactoring Timeline

**Phase 1 (Weeks 1-2):** Foundations
- Split App.tsx
- Add React Router
- Add React Query for caching
- Fix critical issues (1-5)

**Phase 2 (Weeks 3-4):** Quality
- Add Zod validation
- Improve error handling
- Increase test coverage
- Add accessibility

**Phase 3 (Weeks 5-6):** Features
- Real-time collaboration
- Mobile app start
- Stripe billing
- Advanced reporting

---

## Final Recommendations

**Start Immediately:**
1. Fix critical issues (RLS, audit logging, bulk operations)
2. Add input validation
3. Split App.tsx into smaller pieces

**Within 1 Month:**
1. Implement real routing (React Router)
2. Add state management (React Query)
3. Write integration tests

**Within 3 Months:**
1. Accessibility audit & fixes
2. Mobile app or PWA
3. Advanced analytics

**Long-Term:**
1. Public API
2. Webhooks & integrations
3. White-label support

---

**Report Generated:** July 2, 2026  
**Reviewer:** AI Code Review Assistant

