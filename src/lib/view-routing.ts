import type { AppView, Toast } from '../../types';

const PLATFORM_ONLY_VIEWS: AppView[] = ['PLATFORM_DASHBOARD', 'TENANTS', 'INVITATIONS', 'BILLING', 'PLATFORM_SETTINGS'];

export function normalizePlatformView(viewingChurch: boolean, currentView: AppView): AppView {
  if (viewingChurch && PLATFORM_ONLY_VIEWS.includes(currentView)) {
    return 'DASHBOARD';
  }

  return currentView;
}

export function createToastRecord(id: string, message: string, type: Toast['type']): Toast {
  return { id, message, type };
}

const PLATFORM_ONLY_VIEWS: AppView[] = ['PLATFORM_DASHBOARD', 'TENANTS', 'INVITATIONS', 'PLATFORM_SETTINGS'];

export function isPlatformOnlyView(view: AppView): boolean {
  return PLATFORM_ONLY_VIEWS.includes(view);
}

export function getVisibleViewsForContext(
  views: AppView[],
  context: 'platform' | 'workspace',
): AppView[] {
  return context === 'platform' ? views : views.filter(view => !isPlatformOnlyView(view));
}
