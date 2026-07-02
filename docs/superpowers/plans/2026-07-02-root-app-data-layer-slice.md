# Root App Data Layer Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the root Vite app's church-scoped read path and audit-log writes from `components/App.tsx` into a focused data service without changing visible behavior.

**Architecture:** Add a small service factory in `src/lib` that accepts a Supabase-like client and exposes `loadChurchAppData()` plus `createAuditLog()`. Keep the existing CRUD write helpers in `src/lib/persistence.ts`, and refactor `components/App.tsx` to consume the new service for reads and audit inserts while preserving the current UI state flow.

**Tech Stack:** React 19, TypeScript, Supabase JS, Vitest

## Global Constraints

- Scope only the root Vite app; do not touch `imani-laravel/`
- Preserve current screen behavior and current `App.tsx` state shape
- Keep existing write-side CRUD helpers in `src/lib/persistence.ts`
- Write tests first for the new data service behavior
- Verify with Vitest and `tsc --noEmit` before finishing

---

### Task 1: Add a lightweight test harness

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test -- --run <file>` and `npm run typecheck`

- [ ] **Step 1: Add test and typecheck scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Verify scripts resolve**

Run: `npm run test -- --help`
Expected: Vitest help output

Run: `npm run typecheck`
Expected: TypeScript runs; existing project errors, if any, are visible before feature changes

---

### Task 2: Write failing tests for the app data service

**Files:**
- Create: `src/lib/app-data.test.ts`

**Interfaces:**
- Consumes: none
- Produces: tests for `createChurchAppDataService(client).loadChurchAppData(churchId)` and `createChurchAppDataService(client).createAuditLog(entry)`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createChurchAppDataService } from "./app-data";

describe("createChurchAppDataService", () => {
  it("loads church-scoped data and merges attendance rows into events", async () => {
    const service = createChurchAppDataService(/* fake client */);
    const result = await service.loadChurchAppData("church-1");
    expect(result.events[0].attendance).toEqual(["member-1", "member-2"]);
  });

  it("writes audit logs with the supplied church scope", async () => {
    const service = createChurchAppDataService(/* fake client */);
    await service.createAuditLog({
      userId: "user-1",
      userName: "Admin",
      action: "Login success",
      module: "DASHBOARD",
      severity: "INFO",
      churchId: "church-1",
    });
    expect(/* inserted row */).toMatchObject({ church_id: "church-1" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/lib/app-data.test.ts`
Expected: FAIL because `src/lib/app-data.ts` does not exist yet

---

### Task 3: Implement the data service

**Files:**
- Create: `src/lib/app-data.ts`
- Modify: `src/lib/mappers.ts`

**Interfaces:**
- Consumes: `mapMember`, `mapTransaction`, `mapEvent`, `mapAuditLog` from `src/lib/mappers.ts`
- Produces:
  - `createChurchAppDataService(client)`
  - `loadChurchAppData(churchId?: string | null): Promise<{ members: Member[]; transactions: Transaction[]; events: ChurchEvent[]; auditLogs: AuditLog[] }>`
  - `createAuditLog(input: { userId: string; userName: string; action: string; module: AppView; severity: AuditLog["severity"]; churchId?: string | null }): Promise<void>`

- [ ] **Step 1: Write minimal implementation in `src/lib/app-data.ts`**

```ts
export function createChurchAppDataService(client: SupabaseLikeClient) {
  return {
    async loadChurchAppData(churchId?: string | null) {
      // load members, transactions, events, attendance, audit logs
      // merge attendance rows into events
    },
    async createAuditLog(input: CreateAuditLogInput) {
      // insert one row into audit_logs
    },
  };
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:run -- src/lib/app-data.test.ts`
Expected: PASS

---

### Task 4: Refactor App.tsx to use the service

**Files:**
- Modify: `components/App.tsx`

**Interfaces:**
- Consumes: `createChurchAppDataService(supabase)` from `src/lib/app-data.ts`
- Produces: unchanged UI behavior with data loading delegated to the service

- [ ] **Step 1: Replace raw church-scoped reads with `loadChurchAppData()`**

```ts
const appDataService = createChurchAppDataService(supabase);

useEffect(() => {
  if (!isAuthenticated || viewingPlatform) {
    setDataLoading(false);
    setDataError(null);
    return;
  }

  setDataLoading(true);
  setDataError(null);

  appDataService
    .loadChurchAppData(churchId)
    .then(({ members, transactions, events, auditLogs }) => {
      setMembers(members);
      setTransactions(transactions);
      setEvents(events);
      setAuditLogs(auditLogs);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Failed to load church data.";
      setDataError(message);
      addToast(message, "error");
    })
    .finally(() => setDataLoading(false));
}, [appDataService, churchId, isAuthenticated, viewingPlatform]);
```

- [ ] **Step 2: Replace direct audit insert with `createAuditLog()`**

```ts
await appDataService.createAuditLog({
  userId: currentUser.id,
  userName: currentUser.name,
  action,
  module,
  severity,
  churchId,
});
```

- [ ] **Step 3: Run targeted verification**

Run: `npm run test:run -- src/lib/app-data.test.ts`
Expected: PASS

---

### Task 5: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run the service test suite**

Run: `npm run test:run -- src/lib/app-data.test.ts`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS
