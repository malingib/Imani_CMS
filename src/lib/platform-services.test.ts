import { describe, expect, it } from "vitest";
import { createPlatformDashboardService } from "./platform-dashboard-service";
import { createTenantsService } from "./tenants-service";
import { createBillingService } from "./billing-service";
import { createInvitationsService } from "./invitations-service";
import { createPlatformSettingsService } from "./platform-settings-service";

function createQuery(response: any, log: string[]) {
  const query = {
    select(columns = "*", options?: Record<string, unknown>) {
      log.push(`select:${columns}:${JSON.stringify(options || {})}`);
      return query;
    },
    eq(column: string, value: unknown) {
      log.push(`eq:${column}:${String(value)}`);
      return query;
    },
    order(column: string, options?: Record<string, unknown>) {
      log.push(`order:${column}:${JSON.stringify(options || {})}`);
      return query;
    },
    maybeSingle() {
      return Promise.resolve(response);
    },
    single() {
      return Promise.resolve(response);
    },
    then(resolve: (value: any) => unknown) {
      return Promise.resolve(resolve(response));
    },
  };
  return query;
}

describe("platform services", () => {
  it("loads platform dashboard stats and sums only income revenue", async () => {
    let churchQueryCount = 0;
    const client = {
      from(table: string) {
        if (table === "churches") {
          const response = churchQueryCount === 0
            ? { count: 12, data: null, error: null }
            : { count: 8, data: null, error: null };
          churchQueryCount += 1;
          return createQuery(response, []);
        }
        if (table === "members") {
          return createQuery({ count: 420, data: null, error: null }, []);
        }
        if (table === "transactions") {
          return createQuery({
            data: [{ amount: 1200 }, { amount: 800 }],
            error: null,
          }, []);
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const service = createPlatformDashboardService(client);
    const stats = await service.getStats();

    expect(stats.totalChurches).toBe(12);
    expect(stats.activeChurches).toBe(8);
    expect(stats.totalMembers).toBe(420);
    expect(stats.totalRevenue).toBe(2000);
  });

  it("loads churches with member counts", async () => {
    const client = {
      from(table: string) {
        if (table === "churches") {
          return createQuery({
            data: [
              { id: "church-1", name: "Imani One", slug: "imani-one", tier: "basic", status: "active", created_at: "2026-07-01" },
              { id: "church-2", name: "Imani Two", slug: "imani-two", tier: "pro", status: "suspended", created_at: "2026-07-02" },
            ],
            error: null,
          }, []);
        }
        if (table === "members") {
          return {
            select() {
              return {
                eq(_column: string, value: string) {
                  const count = value === "church-1" ? 15 : 4;
                  return Promise.resolve({ count, data: null, error: null });
                },
              };
            },
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const service = createTenantsService(client);
    const churches = await service.listChurchesWithMemberCounts();

    expect(churches).toEqual([
      expect.objectContaining({ id: "church-1", memberCount: 15 }),
      expect.objectContaining({ id: "church-2", memberCount: 4 }),
    ]);
  });

  it("creates a church with subscription and optional invitation", async () => {
    const inserted: Record<string, any[]> = { churches: [], subscriptions: [], invitations: [] };
    const client = {
      from(table: string) {
        if (table === "churches") {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle() {
                      return Promise.resolve({ data: null, error: null });
                    },
                  };
                },
                order() {
                  return Promise.resolve({ data: [], error: null });
                },
              };
            },
            insert(rows: any[]) {
              inserted.churches.push(...rows);
              return {
                select() {
                  return Promise.resolve({ data: [{ id: "church-99", ...rows[0] }], error: null });
                },
              };
            },
            update() {
              return { eq() { return Promise.resolve({ error: null }); } };
            },
          };
        }
        if (table === "subscriptions" || table === "invitations") {
          return {
            insert(rows: any[]) {
              inserted[table].push(...rows);
              return Promise.resolve({ data: rows, error: null });
            },
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const service = createTenantsService(client);
    const church = await service.createChurchWithDefaults({
      name: "Grace Chapel",
      tier: "pro",
      adminEmail: "admin@grace.test",
    });

    expect(church).toEqual(expect.objectContaining({ id: "church-99", slug: "grace-chapel" }));
    expect(inserted.subscriptions[0]).toEqual(expect.objectContaining({ church_id: "church-99", tier: "pro", status: "trialing" }));
    expect(inserted.invitations[0]).toEqual(expect.objectContaining({ church_id: "church-99", email: "admin@grace.test", role: "ADMIN" }));
  });

  it("loads billing overview with church names and revenue", async () => {
    const client = {
      from(table: string) {
        if (table === "subscriptions") {
          return createQuery({
            data: [{ id: "sub-1", church_id: "church-1", tier: "pro", status: "active", churches: { name: "Imani One" } }],
            error: null,
          }, []);
        }
        if (table === "invoices") {
          return createQuery({
            data: [{ id: "inv-1", church_id: "church-1", amount: 1500, status: "pending", due_date: "2026-08-01", paid_at: null, churches: { name: "Imani One" } }],
            error: null,
          }, []);
        }
        if (table === "transactions") {
          return createQuery({ data: [{ amount: 5000 }, { amount: 2500 }], error: null }, []);
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const service = createBillingService(client);
    const overview = await service.getBillingOverview();

    expect(overview.subscriptions[0].church_name).toBe("Imani One");
    expect(overview.invoices[0].church_name).toBe("Imani One");
    expect(overview.totalRevenue).toBe(7500);
  });

  it("loads invitations and merges platform settings defaults", async () => {
    const client = {
      from(table: string) {
        if (table === "invitations") {
          return createQuery({
            data: [{ id: "inv-1", church_id: "church-1", email: "admin@test.com", role: "ADMIN", token: "abc", expires_at: "2099-01-01T00:00:00.000Z", accepted_at: null, created_at: "2026-07-01T00:00:00.000Z", churches: { name: "Imani One" } }],
            error: null,
          }, []);
        }
        if (table === "churches") {
          return createQuery({ data: [{ id: "church-1", name: "Imani One" }], error: null }, []);
        }
        if (table === "platform_settings") {
          return createQuery({ data: { id: "global", flags: { ai_features: false } }, error: null }, []);
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const invitationsService = createInvitationsService(client);
    const settingsService = createPlatformSettingsService(client);

    const invitations = await invitationsService.listInvitationsWithChurchNames();
    const churches = await invitationsService.listChurchOptions();
    const settings = await settingsService.getPlatformSettings();

    expect(invitations[0].church_name).toBe("Imani One");
    expect(invitationsService.getInvitationStatus(invitations[0])).toBe("Pending");
    expect(churches).toEqual([{ id: "church-1", name: "Imani One" }]);
    expect(settings.flags).toEqual(expect.objectContaining({ sms_integration: true, ai_features: false }));
  });

  it("preserves non-flag settings data when saving platform flags", async () => {
    const writes: any[] = [];
    const client = {
      from(table: string) {
        if (table !== "platform_settings") throw new Error(`unexpected table ${table}`);
        return {
          select() {
            return {
              single() {
                return Promise.resolve({
                  data: {
                    id: "global",
                    flags: {
                      ai_features: true,
                      integrations: { mpesaEnabled: true, mpesaEnv: "Sandbox" },
                    },
                  },
                  error: null,
                });
              },
            };
          },
          upsert(payload: any) {
            writes.push(payload);
            return Promise.resolve({ error: null });
          },
        };
      },
    };

    const settingsService = createPlatformSettingsService(client as any);
    await settingsService.savePlatformSettings({
      sms_integration: false,
      ai_features: false,
      allow_self_signup: true,
      maintenance_mode: false,
    });

    expect(writes[0].flags).toEqual(expect.objectContaining({
      sms_integration: false,
      ai_features: false,
      allow_self_signup: true,
      maintenance_mode: false,
      integrations: { mpesaEnabled: true, mpesaEnv: "Sandbox" },
    }));
  });
});
