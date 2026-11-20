import { describe, expect, it } from "vitest";
import { normalizePlatformView, createToastRecord, getVisibleViewsForContext, isPlatformOnlyView } from "./view-routing";

describe("normalizePlatformView", () => {
  it("keeps non-platform views when viewing church", () => {
    expect(normalizePlatformView(true, "DASHBOARD")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "MEMBERS")).toBe("MEMBERS");
    expect(normalizePlatformView(true, "FINANCE")).toBe("FINANCE");
  });

  it("redirects platform-only views to DASHBOARD when viewing church", () => {
    expect(normalizePlatformView(true, "PLATFORM_DASHBOARD")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "TENANTS")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "INVITATIONS")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "BILLING")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "PLATFORM_SETTINGS")).toBe("DASHBOARD");
  });

  it("keeps all views when not viewing church", () => {
    expect(normalizePlatformView(false, "PLATFORM_DASHBOARD")).toBe("PLATFORM_DASHBOARD");
    expect(normalizePlatformView(false, "TENANTS")).toBe("TENANTS");
    expect(normalizePlatformView(false, "DASHBOARD")).toBe("DASHBOARD");
  });

  it("passes through unknown views unchanged", () => {
    expect(normalizePlatformView(true, "UNKNOWN" as any)).toBe("UNKNOWN" as any);
  });
});

describe("createToastRecord", () => {
  it("creates a toast with given properties", () => {
    const toast = createToastRecord("t1", "Operation successful", "success");
    expect(toast).toEqual({ id: "t1", message: "Operation successful", type: "success" });
  });

  it("accepts different toast types", () => {
    expect(createToastRecord("t2", "Error!", "error").type).toBe("error");
    expect(createToastRecord("t3", "Info", "info").type).toBe("info");
  });
});

describe("workspace context navigation", () => {
  it("never exposes platform-only views in a tenant workspace", () => {
    const views = ["DASHBOARD", "MEMBERS", "PLATFORM_DASHBOARD", "TENANTS", "INVITATIONS", "PLATFORM_SETTINGS"] as const;
    const visible = getVisibleViewsForContext([...views], "workspace");
    expect(visible).toEqual(["DASHBOARD", "MEMBERS"]);
    expect(visible.some(isPlatformOnlyView)).toBe(false);
  });

  it("retains platform navigation only in platform context", () => {
    const views = ["PLATFORM_DASHBOARD", "TENANTS", "DASHBOARD"] as const;
    expect(getVisibleViewsForContext([...views], "platform")).toEqual([...views]);
  });
});
