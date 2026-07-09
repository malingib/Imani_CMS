import { describe, expect, it } from "vitest";
import { mapSupabaseUserToAppUser, getDefaultViewForUserRole } from "./app-user";
import { normalizePlatformView, createToastRecord } from "./view-routing";
import { UserRole } from "../../types";

describe("app shell helpers", () => {
  it("maps a Supabase auth user into the app user model", () => {
    const user = mapSupabaseUserToAppUser({
      id: "user-1",
      email: "admin@church.test",
      user_metadata: { name: "Admin User", avatar_url: "https://avatar.test/admin.png" },
      app_metadata: { role: UserRole.ADMIN, church_id: "church-1" },
    });

    expect(user).toEqual(expect.objectContaining({
      id: "user-1",
      name: "Admin User",
      role: UserRole.ADMIN,
      churchId: "church-1",
      avatar: "https://avatar.test/admin.png",
    }));
  });

  it("prefers app metadata role and defaults to member when role metadata is missing", () => {
    const appRoleUser = mapSupabaseUserToAppUser({
      id: "user-2",
      email: "pastor@church.test",
      user_metadata: { role: UserRole.ADMIN, name: "Pastor Jane" },
      app_metadata: { role: UserRole.PASTOR, church_id: "church-2" },
    });

    const fallbackUser = mapSupabaseUserToAppUser({
      id: "user-3",
      email: "member@church.test",
      user_metadata: { name: "Member Joe" },
      app_metadata: {},
    });

    expect(appRoleUser.role).toBe(UserRole.PASTOR);
    expect(fallbackUser.role).toBe(UserRole.MEMBER);
  });

  it("treats the platform owner email as super admin even without metadata", () => {
    const owner = mapSupabaseUserToAppUser({
      id: "owner-1",
      email: "malingib9@gmail.com",
      user_metadata: { name: "Brighton" },
      app_metadata: {},
    });

    expect(owner.role).toBe(UserRole.SUPER_ADMIN);
    expect(owner.churchId).toBeUndefined();
  });

  it("chooses the correct default view for each role", () => {
    expect(getDefaultViewForUserRole(UserRole.MEMBER)).toBe("MY_PORTAL");
    expect(getDefaultViewForUserRole(UserRole.SUPER_ADMIN)).toBe("PLATFORM_DASHBOARD");
    expect(getDefaultViewForUserRole(UserRole.ADMIN)).toBe("DASHBOARD");
  });

  it("normalizes platform-only views when a super admin is scoped into a church", () => {
    expect(normalizePlatformView(true, "PLATFORM_DASHBOARD")).toBe("DASHBOARD");
    expect(normalizePlatformView(true, "TENANTS")).toBe("DASHBOARD");
    expect(normalizePlatformView(false, "TENANTS")).toBe("TENANTS");
  });

  it("creates toast records with a stable message payload", () => {
    const toast = createToastRecord("toast-1", "Saved", "success");
    expect(toast).toEqual({ id: "toast-1", message: "Saved", type: "success" });
  });
});
