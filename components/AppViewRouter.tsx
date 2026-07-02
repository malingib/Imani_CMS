import React, { Suspense } from 'react';
import { AppView, Member, User, UserRole, AppNotification, AuditLog, Budget, ChurchEvent, Transaction, CommunicationLog, RecurringExpense } from '../types';
import Sidebar from './Sidebar';
import ErrorBoundary from './shared/ErrorBoundary';

const Dashboard = React.lazy(() => import('./Dashboard'));
import Membership from './Membership';
import EventsManagement from './EventsManagement';
const FinanceReporting = React.lazy(() => import('./FinanceReporting'));
import CommunicationCenter from './CommunicationCenter';
const DemographicsAnalysis = React.lazy(() => import('./DemographicsAnalysis'));
import GroupsManagement from './GroupsManagement';
const ReportsCenter = React.lazy(() => import('./ReportsCenter'));
import Settings from './Settings';
import Login from './Login';
import PrivacyPolicy from './PrivacyPolicy';
import CompliancePortal from './CompliancePortal';
import SecurityOverview from './SecurityOverview';
import MemberPortal from './MemberPortal';
const MyGiving = React.lazy(() => import('./MyGiving'));
import AuditLogs from './AuditLogs';
import Billing from './Billing';
import PlatformDashboard from './PlatformDashboard';
import TenantRegistry from './TenantRegistry';
import PlatformSettings from './PlatformSettings';
import BillingOverview from './BillingOverview';
import InvitationsManager from './InvitationsManager';

interface AppViewRouterProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  setActiveChurchId: (id: string | null) => void;
  isSuperAdmin: boolean;
  viewingPlatform: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  churchId: string | null;
  members: Member[];
  transactions: Transaction[];
  events: ChurchEvent[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  communications: CommunicationLog[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  createAudit: (action: string, module: AppView, severity?: AuditLog['severity']) => void;
  handleAddMember: (member: Member) => void;
  handleAddMembersBulk: (members: Member[]) => void;
  handleUpdateMember: (member: Member) => void;
  handleDeleteMember: (id: string) => void;
  handleAddTransaction: (transaction: Transaction) => void;
  handleUpdateTransaction: (transaction: Transaction) => void;
  handleDeleteTransaction: (id: string) => void;
  handleAddEvent: (event: ChurchEvent) => void;
  handleDeleteEvent: (id: string) => void;
  handleUpdateAttendance: (eventId: string, memberIds: string[]) => void;
  handleRSVP: (eventId: string, isRSVPing: boolean) => void;
  handleUpdateProfile: (member: Member) => void;
  handleSetBudget: (budget: Budget) => void;
  handleAddRecurring: (expense: RecurringExpense) => void;
  handleSendBroadcast: (log: CommunicationLog) => void;
}

const AppViewRouter: React.FC<AppViewRouterProps> = ({
  currentView, setCurrentView, setActiveChurchId,
  isSuperAdmin, viewingPlatform, isLoggedIn, currentUser, churchId,
  members, transactions, events, budgets, recurringExpenses, communications, auditLogs, notifications,
  addToast, createAudit,
  handleAddMember, handleAddMembersBulk, handleUpdateMember, handleDeleteMember,
  handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
  handleAddEvent, handleDeleteEvent, handleUpdateAttendance, handleRSVP,
  handleUpdateProfile, handleSetBudget, handleAddRecurring, handleSendBroadcast,
}) => {
  if (currentView === 'PRIVACY') return <ErrorBoundary key="PRIVACY"><PrivacyPolicy onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} /></ErrorBoundary>;
  if (currentView === 'COMPLIANCE') return <ErrorBoundary key="COMPLIANCE"><CompliancePortal onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} /></ErrorBoundary>;
  if (currentView === 'SECURITY') return <ErrorBoundary key="SECURITY"><SecurityOverview onBack={() => isLoggedIn ? setCurrentView('SETTINGS') : setCurrentView('DASHBOARD')} /></ErrorBoundary>;

  if (!isLoggedIn || !currentUser) return null;

  if (isSuperAdmin && viewingPlatform) {
    switch (currentView) {
      case 'PLATFORM_DASHBOARD': return <ErrorBoundary key="PLATFORM_DASHBOARD"><PlatformDashboard /></ErrorBoundary>;
      case 'TENANTS': return <ErrorBoundary key="TENANTS"><TenantRegistry onImpersonate={(id) => { setActiveChurchId(id); setCurrentView('DASHBOARD'); }} /></ErrorBoundary>;
      case 'INVITATIONS': return <ErrorBoundary key="INVITATIONS"><InvitationsManager /></ErrorBoundary>;
      case 'BILLING': return <ErrorBoundary key="BILLING"><BillingOverview /></ErrorBoundary>;
      case 'PLATFORM_SETTINGS': return <ErrorBoundary key="PLATFORM_SETTINGS"><PlatformSettings /></ErrorBoundary>;
      default: return <ErrorBoundary key="PLATFORM_DASHBOARD"><PlatformDashboard /></ErrorBoundary>;
    }
  }

  switch (currentView) {
    case 'DASHBOARD':
      return <ErrorBoundary key="DASHBOARD"><Dashboard members={members} transactions={transactions} events={events} onAddMember={() => setCurrentView('MEMBERS')} onSendSMS={() => setCurrentView('COMMUNICATION')} onNavigate={setCurrentView} /></ErrorBoundary>;
    case 'MY_PORTAL':
      return <ErrorBoundary key="MY_PORTAL"><MemberPortal member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} events={events} activities={[]} churchId={churchId || ''} onNavigate={setCurrentView} onUpdateProfile={handleUpdateProfile} onRSVP={handleRSVP} /></ErrorBoundary>;
    case 'MY_GIVING':
      return <ErrorBoundary key="MY_GIVING"><MyGiving member={members.find(m => m.id === currentUser.memberId) || members[0]} transactions={transactions} onGive={() => { addToast('STK Push Sent'); createAudit('Initiated Giving STK', 'MY_GIVING'); }} /></ErrorBoundary>;
    case 'MEMBERS':
      return <ErrorBoundary key="MEMBERS"><Membership members={members} onAddMember={handleAddMember} onAddMembersBulk={handleAddMembersBulk} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} transactions={transactions} events={events} currentUserRole={currentUser.role} /></ErrorBoundary>;
    case 'FINANCE':
      return <ErrorBoundary key="FINANCE"><FinanceReporting transactions={transactions} members={members} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={handleDeleteTransaction} budgets={budgets} onSetBudget={handleSetBudget} recurringExpenses={recurringExpenses} onAddRecurring={handleAddRecurring} currentUserRole={currentUser.role} /></ErrorBoundary>;
    case 'COMMUNICATION':
      return <ErrorBoundary key="COMMUNICATION"><CommunicationCenter members={members} logs={communications} onSendBroadcast={handleSendBroadcast} currentUser={currentUser} /></ErrorBoundary>;
    case 'GROUPS':
      return <ErrorBoundary key="GROUPS"><GroupsManagement members={members} /></ErrorBoundary>;
    case 'EVENTS':
      return <ErrorBoundary key="EVENTS"><EventsManagement events={events} members={members} currentUser={currentUser} onRSVP={handleRSVP} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onUpdateAttendance={handleUpdateAttendance} /></ErrorBoundary>;
    case 'ANALYTICS':
      return <ErrorBoundary key="ANALYTICS"><DemographicsAnalysis members={members} /></ErrorBoundary>;
    case 'REPORTS':
      return <ErrorBoundary key="REPORTS"><ReportsCenter transactions={transactions} members={members} events={events} /></ErrorBoundary>;
    case 'AUDIT_LOGS':
      return <ErrorBoundary key="AUDIT_LOGS"><AuditLogs logs={auditLogs} /></ErrorBoundary>;
    case 'BILLING':
      return <ErrorBoundary key="BILLING"><Billing /></ErrorBoundary>;
    case 'SETTINGS':
      return <ErrorBoundary key="SETTINGS"><Settings currentUserRole={currentUser.role} churchId={churchId || ''} /></ErrorBoundary>;
    default:
      return <ErrorBoundary key="DASHBOARD"><Dashboard members={members} transactions={transactions} events={events} onAddMember={() => {}} onSendSMS={() => {}} onNavigate={setCurrentView} /></ErrorBoundary>;
  }
};

export default AppViewRouter;