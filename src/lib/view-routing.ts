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
