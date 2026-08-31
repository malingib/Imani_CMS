/**
 * Client-side route definitions for Imani CMS.
 */
import { AppView } from '../../types';

export interface Route {
  view: AppView;
  path: string;
  label: string;
}

export const ROUTES: Record<AppView, Route> = {
  DASHBOARD: { view: 'DASHBOARD', path: '/dashboard', label: 'Dashboard' },
  MEMBERS: { view: 'MEMBERS', path: '/members', label: 'Members' },
  FINANCE: { view: 'FINANCE', path: '/finance', label: 'Finance' },
  PROJECTS: { view: 'PROJECTS', path: '/projects', label: 'Projects' },
  GROUPS: { view: 'GROUPS', path: '/groups', label: 'Groups' },
  EVENTS: { view: 'EVENTS', path: '/events', label: 'Events' },
  COMMUNICATION: { view: 'COMMUNICATION', path: '/communication', label: 'Communication' },
  REPORTS: { view: 'REPORTS', path: '/reports', label: 'Reports' },
  SERMONS: { view: 'SERMONS', path: '/sermons', label: 'Sermons' },
  ANALYTICS: { view: 'ANALYTICS', path: '/analytics', label: 'Analytics' },
  SETTINGS: { view: 'SETTINGS', path: '/settings', label: 'Settings' },
  AUDIT_LOGS: { view: 'AUDIT_LOGS', path: '/audit-logs', label: 'Audit Logs' },
  BILLING: { view: 'BILLING', path: '/billing', label: 'Billing' },
  MY_PORTAL: { view: 'MY_PORTAL', path: '/my-portal', label: 'My Portal' },
  MY_GIVING: { view: 'MY_GIVING', path: '/my-giving', label: 'My Giving' },
  PRIVACY: { view: 'PRIVACY', path: '/privacy', label: 'Privacy Policy' },
  COMPLIANCE: { view: 'COMPLIANCE', path: '/compliance', label: 'Compliance' },
  SECURITY: { view: 'SECURITY', path: '/security', label: 'Security' },
  PLATFORM_DASHBOARD: { view: 'PLATFORM_DASHBOARD', path: '/platform', label: 'Platform' },
  TENANTS: { view: 'TENANTS', path: '/tenants', label: 'Tenants' },
  INVITATIONS: { view: 'INVITATIONS', path: '/invitations', label: 'Invitations' },
  PLATFORM_SETTINGS: { view: 'PLATFORM_SETTINGS', path: '/platform-settings', label: 'Platform Settings' },
};

export function pathToView(path: string): AppView | null {
  return Object.values(ROUTES).find(route => route.path === path)?.view ?? null;
}

export function viewToPath(view: AppView): string {
  return ROUTES[view]?.path ?? '/dashboard';
}

export function getCurrentViewFromHash(): AppView {
  return pathToView(window.location.hash.slice(1) || '/dashboard') ?? 'DASHBOARD';
}

export function navigateToView(view: AppView): void {
  window.location.hash = viewToPath(view);
}

export function onHashChange(callback: (view: AppView) => void): () => void {
  const handler = () => callback(getCurrentViewFromHash());
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

export function getAllRoutes(): Route[] {
  return Object.values(ROUTES);
}

export function getRoute(view: AppView): Route {
  return ROUTES[view];
}
