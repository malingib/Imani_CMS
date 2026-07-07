/**
 * Client-side router for Imani CMS
 * Manages navigation between views with URL hash routing and history support
 */

import { AppView } from '../../types';

export interface Route {
  view: AppView;
  path: string;
  label: string;
}

// Define all available routes
export const ROUTES: Record<AppView, Route> = {
  DASHBOARD: { view: 'DASHBOARD', path: '/dashboard', label: 'Dashboard' },
  MEMBERS: { view: 'MEMBERS', path: '/members', label: 'Members' },
  FINANCE: { view: 'FINANCE', path: '/finance', label: 'Finance' },
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

/**
 * Convert path to view (e.g., '/dashboard' -> 'DASHBOARD')
 */
export function pathToView(path: string): AppView | null {
  const route = Object.values(ROUTES).find(r => r.path === path);
  return route?.view ?? null;
}

/**
 * Convert view to path (e.g., 'DASHBOARD' -> '/dashboard')
 */
export function viewToPath(view: AppView): string {
  return ROUTES[view]?.path ?? '/dashboard';
}

/**
 * Get current view from URL hash
 */
export function getCurrentViewFromHash(): AppView {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const view = pathToView(hash);
  return view ?? 'DASHBOARD';
}

/**
 * Navigate to a view by updating URL hash
 */
export function navigateToView(view: AppView): void {
  const path = viewToPath(view);
  window.location.hash = path;
}

/**
 * Listen for URL changes and call callback
 */
export function onHashChange(callback: (view: AppView) => void): () => void {
  const handler = () => {
    const view = getCurrentViewFromHash();
    callback(view);
  };

  window.addEventListener('hashchange', handler);
  
  // Return cleanup function
  return () => window.removeEventListener('hashchange', handler);
}

/**
 * Get all routes
 */
export function getAllRoutes(): Route[] {
  return Object.values(ROUTES);
}

/**
 * Get route by view
 */
export function getRoute(view: AppView): Route {
  return ROUTES[view];
}
