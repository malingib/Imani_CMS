import { describe, expect, it } from "vitest";
import { createTenantOnboardingService, type OnboardingStep } from "./tenant-onboarding-service";

type FakeRow = Record<string, unknown>;

function fakeClient() {
  const tables: Record<string, FakeRow[]> = {
    churches: [],
    subscriptions: [],
    invitations: [],
    members: [],
  };
  const failOnTable = new Set<string>();

  function findRow(table: string, col: string, val: string) {
    return (tables[table] || []).find((r) => r[col] === val) || null;
  }

  function query(table: string) {
    const self = {
      insert(rows: FakeRow[]) {
        if (failOnTable.has(table)) return Promise.reject(new Error(`DB down on ${table}`));
        const inserted = rows.map((r) => ({ ...r, id: crypto.randomUUID() }));
        inserted.forEach((r) => (tables[table] = tables[table] || []).push(r));
        return { select() { return Promise.resolve({ data: inserted, error: null }); } };
      },
      select(_columns?: string, _opts?: unknown) {
        const data = tables[table] || [];
        const count = data.length;
        const result = Promise.resolve({ data, error: null, count });
        const eq = (col: string, val: string) => {
          const row = findRow(table, col, val);
          const eqResult = Promise.resolve({ data: row, error: null });
          return {
            maybeSingle() { return eqResult; },
            order() { return result; },
            then(resolve: (v: unknown) => unknown) { return result.then(resolve); },
          };
        };
        return {
          eq,
          order() { return result; },
          then(resolve: (v: unknown) => unknown) { return result.then(resolve); },
        };
      },
      update(values: FakeRow) {
        return {
          eq(col: string, val: string) {
            const row = findRow(table, col, val);
            if (row) Object.assign(row, values);
            return Promise.resolve({ data: [values], error: null });
          },
        };
      },
      delete() {
        const deleted = [...(tables[table] || [])];
        tables[table] = [];
        return {
          eq() { return Promise.resolve({ data: deleted, error: null }); },
        };
      },
    };
    return self;
  }

  return {
    _tables: tables,
    setFailOn(table: string) { failOnTable.add(table); },
    from(table: string) { return query(table); },
  };
}

describe("tenant onboarding service", () => {
  it("creates a church with trial subscription and onboarding step tracking", async () => {
    const client = fakeClient();
    const service = createTenantOnboardingService(client as any);

    const result = await service.createTenantWithOnboarding({
      name: "Grace Chapel",
      tier: "pro",
      adminEmail: "pastor@grace.test",
    });

    expect(result.church.name).toBe("Grace Chapel");
    expect(result.church.tier).toBe("pro");
    expect(result.church.status).toBe("trialing");
    expect(result.church.trialEndDate).toBeTruthy();
    expect(result.onboardingStep).toBe("welcome");

    const subs = client._tables.subscriptions;
    expect(subs).toHaveLength(1);
    expect(subs[0].tier).toBe("pro");
    expect(subs[0].status).toBe("trialing");

    const invites = client._tables.invitations;
    expect(invites).toHaveLength(1);
    expect(invites[0].email).toBe("pastor@grace.test");
  });

  it("returns the current onboarding status with completed steps", async () => {
    const client = fakeClient();
    const service = createTenantOnboardingService(client as any);

    const { church } = await service.createTenantWithOnboarding({
      name: "Test Church",
      tier: "basic",
    });

    const status = await service.getOnboardingStatus(church.id);
    expect(status.steps).toBeInstanceOf(Array);
    const welcomeStep = status.steps.find((s: OnboardingStep) => s.id === "welcome");
    expect(welcomeStep).toBeDefined();
    expect(welcomeStep!.completed).toBe(false);
  });

  it("marks an onboarding step as completed", async () => {
    const client = fakeClient();
    const service = createTenantOnboardingService(client as any);

    const { church } = await service.createTenantWithOnboarding({
      name: "Faith Assembly",
      tier: "basic",
    });

    await service.completeOnboardingStep(church.id, "welcome");

    const status = await service.getOnboardingStatus(church.id);
    const welcomeStep = status.steps.find((s: OnboardingStep) => s.id === "welcome");
    expect(welcomeStep!.completed).toBe(true);
  });

  it("rolls back church creation when subscription insert fails", async () => {
    const client = fakeClient();
    client.setFailOn("subscriptions");
    const service = createTenantOnboardingService(client as any);

    await expect(
      service.createTenantWithOnboarding({
        name: "Rollback Church",
        tier: "basic",
      })
    ).rejects.toThrow("DB down on subscriptions");

    expect(client._tables.churches).toHaveLength(0);
  });

  it("lists churches with onboarding progress", async () => {
    const client = fakeClient();
    const service = createTenantOnboardingService(client as any);

    await service.createTenantWithOnboarding({ name: "Alpha Church", tier: "basic" });
    await service.createTenantWithOnboarding({ name: "Beta Church", tier: "pro" });

    const list = await service.listChurchesWithOnboardingStatus();
    expect(list).toHaveLength(2);
    expect(list[0].onboardingStep).toBeDefined();
  });

  it("uses preloaded member counts instead of per-church member count queries", async () => {
    const queryLog: string[] = [];
    const client = {
      from(table: string) {
        if (table === "churches") {
          return {
            select() {
              queryLog.push("churches.select");
              return {
                order() {
                  return Promise.resolve({
                    data: [
                      { id: "church-1", name: "Alpha", slug: "alpha", tier: "basic", status: "trialing", onboarding_step: "welcome", member_count: 8 },
                      { id: "church-2", name: "Beta", slug: "beta", tier: "pro", status: "active", onboarding_step: "complete", member_count: 3 },
                    ],
                    error: null,
                  });
                },
              };
            },
          };
        }
        if (table === "members") {
          return {
            select() {
              queryLog.push("members.select");
              return { eq() { return Promise.resolve({ count: 99, data: null, error: null }); } };
            },
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const service = createTenantOnboardingService(client as any);
    const list = await service.listChurchesWithOnboardingStatus();

    expect(list).toEqual([
      expect.objectContaining({ id: "church-1", memberCount: 8 }),
      expect.objectContaining({ id: "church-2", memberCount: 3 }),
    ]);
    expect(queryLog).not.toContain("members.select");
  });
});
