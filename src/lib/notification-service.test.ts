import { describe, expect, it } from "vitest";
import type { AppNotification } from "../../types";
import { countUnread, getNotificationBadge } from "./notification-service";

describe("notification service", () => {
  it("counts unread notifications", () => {
    const notifications: AppNotification[] = [
      { id: "n1", title: "New member", message: "John joined", time: "2026-07-01T10:00:00Z", type: "SYSTEM", read: false },
      { id: "n2", title: "Payment", message: "MPesa received", time: "2026-07-01T11:00:00Z", type: "MPESA", read: false },
      { id: "n3", title: "Event", message: "Service tomorrow", time: "2026-07-01T12:00:00Z", type: "EVENT", read: true },
    ];

    expect(countUnread(notifications)).toBe(2);
  });

  it("returns 0 badge when none unread", () => {
    const notifications: AppNotification[] = [
      { id: "n1", title: "Read", message: "Already seen", time: "2026-07-01T10:00:00Z", type: "MEMBER", read: true },
    ];

    const badge = getNotificationBadge(notifications);
    expect(badge.count).toBe(0);
    expect(badge.show).toBe(false);
  });

  it("shows badge when unread exist", () => {
    const notifications: AppNotification[] = [
      { id: "n1", title: "Unread", message: "Not yet seen", time: "2026-07-01T10:00:00Z", type: "SYSTEM", read: false },
    ];

    const badge = getNotificationBadge(notifications);
    expect(badge.count).toBe(1);
    expect(badge.show).toBe(true);
  });

  it("caps badge count at 99+", () => {
    const notifications: AppNotification[] = Array.from({ length: 150 }, (_, i) => ({
      id: `n${i}`,
      title: `Notification ${i}`,
      message: "Bulk",
      time: "2026-07-01T10:00:00Z",
      type: "SYSTEM" as const,
      read: false,
    }));

    const badge = getNotificationBadge(notifications);
    expect(badge.count).toBe(99);
    expect(badge.label).toBe("99+");
  });
});
