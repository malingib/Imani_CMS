
export enum MemberStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  VISITOR = 'Visitor',
  YOUTH = 'Youth',
  DECEASED = 'Deceased',
  ARCHIVED = 'Archived'
}

export enum MaritalStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  WIDOWED = 'Widowed',
  DIVORCED = 'Divorced'
}

export enum MembershipType {
  FULL = 'Full Member',
  PROBATION = 'Probation',
  ASSOCIATE = 'Associate',
  CLERGY = 'Clergy',
  NON_COMMUNICANT = 'Non-Communicant'
}

export enum UserRole {
  SYSTEM_OWNER = 'SYSTEM_OWNER',
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER'
}

// Add Modality enum for Gemini API consistency
export enum Modality {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  memberId?: string;
  branch?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  location: string;
  groups: string[];
  status: MemberStatus;
  joinDate: string;
  birthday?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: MaritalStatus;
  membershipType?: MembershipType;
  photo?: string;
  stewardshipScore?: number; 
}

export type TransactionType = 'Tithe' | 'Offering' | 'Project' | 'Harambee' | 'Benevolence' | 'Expense' | 'Salary' | 'Utility' | 'Maintenance';

export interface Transaction {
  id: string;
  memberId?: string;
  memberName: string;
  amount: number;
  type: TransactionType;
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer' | 'Cheque';
  date: string;
  reference: string;
  category: 'Income' | 'Expense';
  notes?: string;
  phoneNumber?: string;
  source: 'MANUAL' | 'INTEGRATED';
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Suspended' | 'Trialing' | 'Past Due';
  ownerEmail: string;
  region: string;
  memberCount: number;
  mrr: number;
  renewalDate: string;
  healthScore: number;
  usageMetrics?: {
    cpu: number;
    memory: number;
    dbConnections: number;
    smsSent: number;
  };
}

export interface SupportTicket {
  id: string;
  tenantName: string;
  subject: string;
  description: string;
  status: 'Open' | 'Pending' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  lastUpdate: string;
}

export interface StewardshipPledge {
  id: string;
  memberId: string;
  category: TransactionType;
  targetAmount: number;
  period: 'Monthly' | 'Yearly';
  startDate: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
}

export interface MemberActivity {
  id: string;
  memberId: string;
  type: 'PAYMENT' | 'EVENT_RSVP' | 'PROFILE_UPDATE' | 'GROUP_JOIN';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: AppView;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  metadata?: any;
}

export type ChurchEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: ChurchEventType;
  coordinator?: string;
  attendance: string[];
  contactPerson?: string;
  rsvpDeadline?: string;
  recurrence?: RecurrenceType;
  coordinates?: { lat: number; lng: number };
}

export type ChurchEventType = 
  | 'WORSHIP' 
  | 'BIBLE_STUDY' 
  | 'PRAYER' 
  | 'OUTREACH' 
  | 'YOUTH' 
  | 'OTHER';

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'SYSTEM' | 'MPESA' | 'MEMBER' | 'EVENT';
  read: boolean;
}

export type AppView = 
  | 'DASHBOARD' 
  | 'MEMBERS' 
  | 'FINANCE' 
  | 'GROUPS' 
  | 'EVENTS' 
  | 'COMMUNICATION' 
  | 'REPORTS' 
  | 'SERMONS' 
  | 'ANALYTICS' 
  | 'SETTINGS' 
  | 'AUDIT_LOGS'
  | 'BILLING'
  | 'MY_PORTAL' 
  | 'MY_GIVING' 
  | 'PRIVACY' 
  | 'COMPLIANCE' 
  | 'SECURITY'
  | 'OWNER_DASHBOARD'
  | 'PARISH_REGISTRY'
  | 'PLATFORM_SUPPORT'
  | 'INFRASTRUCTURE';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CommunicationLog {
  id: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  recipientCount: number;
  targetGroupName: string;
  subject: string;
  content: string;
  date: string;
  status: 'Sent' | 'Scheduled' | 'Failed';
  sender: string;
  scheduledFor?: string;
  deliveryBreakdown?: {
    delivered: number;
    opened: number;
    failed: number;
  };
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  content: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  subject?: string;
}

export interface SystemRole {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  modules: string[];
}

export interface RecurringExpense {
  id: string;
  category: string;
  recipient: string;
  amount: number;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  nextDate: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface RecurringContribution {
  id: string;
  memberId: string;
  memberName: string;
  type: TransactionType;
  amount: number;
  frequency: 'Monthly' | 'Yearly';
  nextDueDate: string;
  status: 'ACTIVE' | 'CANCELLED';
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  scripture: string;
  event: string;
  eventId: string;
  transcript: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED';
}
