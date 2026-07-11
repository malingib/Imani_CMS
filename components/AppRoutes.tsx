import React, { lazy, useState, Suspense, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar, { ImaniLogoIcon } from './Sidebar';
import { useApp } from '../src/lib/AppProvider';
import { useChurch } from '../src/lib/church-context';
import { ROUTES, pathToView } from '../src/lib/router';
import { AppView, UserRole } from '../types';
import { getDefaultViewForUserRole } from '../src/lib/app-user';
import { triggerStkPush } from '../src/lib/mpesa-service';
import { SkeletonBlock, NotFound, ToastContainer, ErrorFallback } from './shared';
import NotificationsPanel from './NotificationsPanel';

const ADMIN_VIEWS: AppView[] = [
  'DASHBOARD', 'MEMBERS', 'FINANCE', 'GROUPS', 'EVENTS', 'COMMUNICATION',
  'REPORTS', 'ANALYTICS', 'SERMONS', 'AUDIT_LOGS', 'BILLING', 'SETTINGS',
];
const MEMBER_VIEWS: AppView[] = ['MY_PORTAL', 'MY_GIVING', 'SERMONS'];
const PLATFORM_VIEWS: AppView[] = [
  'PLATFORM_DASHBOARD', 'TENANTS', 'INVITATIONS', 'BILLING', 'PLATFORM_SETTINGS',
];

const ROLE_VIEWS: Record<UserRole, AppView[]> = {
  SUPER_ADMIN: [...ADMIN_VIEWS, ...PLATFORM_VIEWS],
  ADMIN: ADMIN_VIEWS,
  PASTOR: ['DASHBOARD', 'MEMBERS', 'EVENTS', 'COMMUNICATION', 'GROUPS', 'REPORTS', 'ANALYTICS', 'SERMONS'],
  TREASURER: ['DASHBOARD', 'FINANCE', 'REPORTS'],
  SECRETARY: ['DASHBOARD', 'MEMBERS', 'EVENTS', 'COMMUNICATION'],
  MEMBER: MEMBER_VIEWS,
};

function canAccess(view: AppView, role: UserRole, viewingPlatform: boolean): boolean {
  if (viewingPlatform && PLATFORM_VIEWS.includes(view)) return role === UserRole.SUPER_ADMIN;
  const allowed = ROLE_VIEWS[role] || [];
  return allowed.includes(view);
}

const Login = lazy(() => import('./Login'));
const Dashboard = lazy(() => import('./Dashboard'));
const Membership = lazy(() => import('./Membership'));
const EventsManagement = lazy(() => import('./EventsManagement'));
const FinanceReporting = lazy(() => import('./FinanceReporting'));
const CommunicationCenter = lazy(() => import('./CommunicationCenter'));
const DemographicsAnalysis = lazy(() => import('./DemographicsAnalysis'));
const GroupsManagement = lazy(() => import('./GroupsManagement'));
const ReportsCenter = lazy(() => import('./ReportsCenter'));
const Settings = lazy(() => import('./Settings'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const CompliancePortal = lazy(() => import('./CompliancePortal'));
const SecurityOverview = lazy(() => import('./SecurityOverview'));
const MemberPortal = lazy(() => import('./MemberPortal'));
const MyGiving = lazy(() => import('./MyGiving'));
const AuditLogs = lazy(() => import('./AuditLogs'));
const Billing = lazy(() => import('./Billing'));
const PlatformDashboard = lazy(() => import('./PlatformDashboard'));
const TenantRegistry = lazy(() => import('./TenantRegistry'));
const PlatformSettings = lazy(() => import('./PlatformSettings'));
const BillingOverview = lazy(() => import('./BillingOverview'));
const InvitationsManager = lazy(() => import('./InvitationsManager'));
const SermonHistory = lazy(() => import('./SermonHistory'));
const AcceptInvite = lazy(() => import('./AcceptInvite'));
const LandingPage = lazy(() => import('./LandingPage'));

function Protected({ children }: { children: React.ReactNode }) {
  const { loading, dataError, refreshData } = useApp();
  if (loading === 'auth-loading' || loading === 'data-loading') return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <SkeletonBlock />
    </div>
  );
  if (loading === 'error' && dataError) {
    return <ErrorFallback error={new Error(dataError)} onRetry={refreshData} fullPage={false} />;
  }
  return <>{children}</>;
}

const AccountShell = () => {
  const { currentUser, toasts, members, handleAddMember, handleAddMembersBulk, handleUpdateMember, handleDeleteMember, transactions, events, budgets, recurringExpenses, communications, groups, sermons, auditLogs, handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction, handleSetBudget, handleAddRecurring, handleSendBroadcast, handleRSVP, handleAddEvent, handleUpdateEvent, handleDeleteEvent, handleUpdateAttendance, handleUpdateProfile, addToast, createAudit, notifications, viewingPlatform, viewingChurch, handleAddGroup, handleUpdateGroup, handleDeleteGroup, handleSelectChurch, handleMarkNotificationRead, handleMarkAllNotificationsRead, handleDeleteNotification } = useApp();
  const { churches, activeChurchId } = useChurch();
  const location = useLocation();
  const navigateToPath = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const churchId = activeChurchId ?? currentUser?.churchId ?? null;
  const currentMember = members.find(m => m.id === currentUser?.memberId);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleGive = async () => {
    addToast('Initiating STK Push...');
    createAudit('Initiated Giving STK', 'MY_GIVING');
    const memberPhone = currentMember?.phone || '';
    const result = await triggerStkPush(0, memberPhone, 'Tithe', currentMember?.firstName || '');
    if (result.success) {
      addToast(result.message);
    } else {
      addToast(result.message || 'Payment could not be processed.');
    }
  };

  if (!currentUser) {
    return null;
  }

  const navigate = (v: AppView) => navigateToPath(ROUTES[v].path);

  const currentView = pathToView(location.pathname) || 'DASHBOARD';
  const viewAllowed = canAccess(currentView, currentUser.role, viewingPlatform);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleLogout = async () => {
    createAudit('Logout', 'DASHBOARD');
    const { supabase } = await import('../src/lib/supabase-auth');
    await supabase.auth.signOut();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)} />
      <Sidebar
        currentView={pathToView(location.pathname) || 'DASHBOARD'}
        setView={(v) => { navigate(v); setSidebarOpen(false); }}
        currentUser={currentUser}
        branches={[]}
        onBranchChange={() => {}}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        churches={churches}
        activeChurchId={activeChurchId}
        onChurchSwitch={(id) => {
          handleSelectChurch(id);
          setSidebarOpen(false);
        }}
      />
      <main className="flex-1 min-h-screen lg:ml-64 transition-all">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu size={22} /></button>
            <div className="lg:hidden w-10 h-10"><ImaniLogoIcon /></div>
          </div>
          <div className="flex items-center gap-4 relative">
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-slate-50 relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-primary text-white text-[9px] font-black rounded-full border-2 border-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationsPanel
                  notifications={notifications}
                  onClose={() => setNotifOpen(false)}
                  onMarkAsRead={handleMarkNotificationRead}
                  onMarkAllAsRead={handleMarkAllNotificationsRead}
                  onDelete={handleDeleteNotification}
                />
              )}
            </div>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-primary/10" />
            </div>
          </div>
        </header>
        <div className="p-10 max-w-[1600px] mx-auto pb-20">
          <Suspense fallback={
            <div className="space-y-8 animate-pulse p-10">
              <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-slate-100 rounded-[2.5rem]" />
                <div className="h-40 bg-slate-100 rounded-[2.5rem]" />
                <div className="h-40 bg-slate-100 rounded-[2.5rem]" />
              </div>
              <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
            </div>
          }>
            {!viewAllowed ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-white rounded-[2.5rem] shadow-xl p-12 max-w-md text-center">
                  <h2 className="text-2xl font-black text-brand-primary mb-2">Access Restricted</h2>
                  <p className="text-slate-500 font-medium">Your role does not have permission to view this page.</p>
                  <button onClick={() => navigate(getDefaultViewForUserRole(currentUser.role))} className="mt-6 px-6 py-3 bg-brand-primary text-white rounded-full font-black text-sm hover:bg-brand-primary/90 transition-all">
                    Go to your dashboard
                  </button>
                </div>
              </div>
            ) : (
            <Routes>
              {viewingPlatform ? (
                <>
                  <Route path={ROUTES.DASHBOARD.path} element={<Navigate to={ROUTES.PLATFORM_DASHBOARD.path} replace />} />
                  <Route path={ROUTES.PLATFORM_DASHBOARD.path} element={<PlatformDashboard />} />
                  <Route path={ROUTES.TENANTS.path} element={<TenantRegistry onImpersonate={handleSelectChurch} />} />
                  <Route path={ROUTES.INVITATIONS.path} element={<InvitationsManager />} />
                  <Route path={ROUTES.BILLING.path} element={<BillingOverview />} />
                  <Route path={ROUTES.PLATFORM_SETTINGS.path} element={<PlatformSettings />} />
                  <Route path="*" element={<Navigate to={ROUTES.PLATFORM_DASHBOARD.path} replace />} />
                </>
              ) : (
                <>
                  <Route path={ROUTES.DASHBOARD.path} element={<Dashboard members={members} transactions={transactions} events={events} onNavigate={navigate} onAddMember={() => navigate('MEMBERS')} onSendSMS={() => navigate('COMMUNICATION')} />} />
                  <Route path={ROUTES.MEMBERS.path} element={<Membership members={members} onAddMember={handleAddMember} onAddMembersBulk={handleAddMembersBulk} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} transactions={transactions} events={events} currentUserRole={currentUser.role} />} />
                  <Route path={ROUTES.FINANCE.path} element={<FinanceReporting transactions={transactions} members={members} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction} budgets={budgets} onSetBudget={handleSetBudget} recurringExpenses={recurringExpenses} onAddRecurring={handleAddRecurring} currentUserRole={currentUser.role} />} />
                  <Route path={ROUTES.GROUPS.path} element={<GroupsManagement members={members} groups={groups} onCreateGroup={handleAddGroup} onUpdateGroup={handleUpdateGroup} onDeleteGroup={handleDeleteGroup} />} />
                  <Route path={ROUTES.EVENTS.path} element={<EventsManagement events={events} members={members} currentUser={currentUser} onRSVP={handleRSVP} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} onUpdateAttendance={handleUpdateAttendance} />} />
                  <Route path={ROUTES.COMMUNICATION.path} element={<CommunicationCenter members={members} logs={communications} onSendBroadcast={handleSendBroadcast} currentUser={currentUser} addToast={addToast} />} />
                  <Route path={ROUTES.REPORTS.path} element={<ReportsCenter transactions={transactions} members={members} events={events} />} />
                  <Route path={ROUTES.SERMONS.path} element={<SermonHistory events={events} sermons={sermons} />} />
                  <Route path={ROUTES.ANALYTICS.path} element={<DemographicsAnalysis members={members} />} />
                  <Route path={ROUTES.SETTINGS.path} element={<Settings currentUserRole={currentUser.role} churchId={churchId || ''} />} />
                  <Route path={ROUTES.AUDIT_LOGS.path} element={<AuditLogs logs={auditLogs} />} />
                  <Route path={ROUTES.BILLING.path} element={<Billing />} />
                  <Route path={ROUTES.MY_PORTAL.path} element={<MemberPortal member={currentMember || null} transactions={transactions} events={events} activities={[]} churchId={churchId || ''} onNavigate={navigate} onUpdateProfile={handleUpdateProfile} onRSVP={handleRSVP} />} />
                  <Route path={ROUTES.MY_GIVING.path} element={<MyGiving member={currentMember || null} transactions={transactions} onGive={handleGive} />} />
                  <Route path="*" element={<Navigate to={ROUTES.DASHBOARD.path} replace />} />
                </>
              )}
            </Routes>
            )}
          </Suspense>
        </div>
      </main>
    </>
  );
};

export default function AppRoutes() {
  const { currentUser, toasts, viewingPlatform, viewingChurch, handleLogin } = useApp();
  const isLoggedIn = !!currentUser;
  const landingPath = viewingPlatform
    ? ROUTES.PLATFORM_DASHBOARD.path
    : ROUTES[getDefaultViewForUserRole(currentUser?.role || UserRole.MEMBER)].path;
  const accountShellElement = <Protected><AccountShell /></Protected>;
  const nav = useNavigate();

  const navigateLegal = (view: AppView) => {
    const path = ROUTES[view]?.path || '/privacy';
    nav(path);
  };

  const loginElement = <Login onLogin={handleLogin} onNavigateLegal={navigateLegal} />;

  return (
    <>
      <ToastContainer toasts={toasts} />
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to={landingPath} replace /> : <LandingPage onGetStarted={() => window.location.href = '/login'} />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to={landingPath} replace /> : loginElement} />
        <Route path={ROUTES.DASHBOARD.path} element={isLoggedIn ? accountShellElement : <Navigate to="/login" replace />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/privacy" element={<PrivacyPolicy onBack={() => nav(-1)} />} />
        <Route path="/compliance" element={<CompliancePortal onBack={() => nav(-1)} />} />
        <Route path="/security" element={<SecurityOverview onBack={() => nav(-1)} />} />
        <Route path="*" element={isLoggedIn ? accountShellElement : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
