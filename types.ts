
export enum MemberStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  VISITOR = 'Visitor',
  YOUTH = 'Youth'
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
  ASSOCIATE = 'Associate'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  location: string;
  group: string; // Cell group / Fellowship
  status: MemberStatus;
  joinDate: string;
  birthday?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: MaritalStatus;
  membershipType?: MembershipType;
  photo?: string; // base64
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'Tithe' | 'Offering' | 'Project' | 'Harambee' | 'Benevolence' | 'Expense';
  paymentMethod: 'M-Pesa' | 'Cash' | 'Bank Transfer';
  date: string;
  reference: string;
  category: 'Income' | 'Expense';
  subCategory?: string; // Custom category assigned by user
  phoneNumber?: string; // For M-Pesa transactions
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'Monthly' | 'Weekly';
  nextDueDate: string;
  isActive: boolean;
}

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  attendance: string[]; // Array of member IDs
  recurrence?: RecurrenceType;
  reminderTime?: string; // e.g., "1 hour before"
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  scripture: string;
  event: string; // Legacy event name string
  eventId?: string; // ID of the associated event from Events module
  transcript?: string; // Full text transcript
}

export interface Permission {
  id: string;
  label: string;
  enabled: boolean;
  critical?: boolean;
}

export interface ModulePermission {
  id: string;
  label: string;
  enabled: boolean;
  permissions: Permission[];
}

export interface SystemRole {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  custom?: boolean;
  modules: ModulePermission[];
}

export interface CommunicationLog {
  id: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  recipientCount: number;
  targetGroupName: string;
  subject: string;
  content: string;
  date: string;
  scheduledFor?: string;
  status: 'Sent' | 'Failed' | 'Scheduled' | 'Draft';
  sender: string;
  deliveryBreakdown?: {
    delivered: number;
    opened: number;
    failed: number;
  };
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  date: string;
  status: 'Completed' | 'Verified' | 'Sent' | 'Failed';
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  subject?: string;
  content: string;
}

export type AppView = 'DASHBOARD' | 'MEMBERS' | 'FINANCE' | 'GROUPS' | 'EVENTS' | 'COMMUNICATION' | 'REPORTS' | 'SERMONS' | 'ANALYTICS' | 'SETTINGS';
