import { describe, expect, it } from "vitest";
import { getDefaultViewForUserRole, mapSupabaseUserToAppUser, resolveUserRole } from "./app-user";
import { UserRole } from "../../types";

describe("limited staff role", () => {
  it("recognises server-provisioned STAFF metadata instead of downgrading it to MEMBER", () => {
    const user = {
      id: "staff-user",
      email: "staff@example.invalid",
      app_metadata: { role: "STAFF", church_id: "church-1" },
      user_metadata: { name: "Staff User" },
    };
    expect(resolveUserRole(user)).toBe(UserRole.STAFF);
    expect(mapSupabaseUserToAppUser(user).role).toBe(UserRole.STAFF);
    expect(getDefaultViewForUserRole(UserRole.STAFF)).toBe("EVENTS");
  });

});
