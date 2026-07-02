import type { AppNotification } from "../../types";

export type BadgeInfo = {
  count: number;
  label: string;
  show: boolean;
};

export function countUnread(notifications: AppNotification[]): number {
  return notifications.filter(n => !n.read).length;
}

export function getNotificationBadge(notifications: AppNotification[]): BadgeInfo {
  const count = countUnread(notifications);
  const show = count > 0;
  const label = count > 99 ? "99+" : String(count);

  return { count: Math.min(count, 99), label, show };
}
