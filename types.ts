
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
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER'
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
  group: string;
  status: MemberStatus;
  joinDate: string;
  birthday?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: MaritalStatus;
  membershipType?: MembershipType;
  photo?: string;
  stewardshipScore?: number; // 0-100 based on attendance/giving
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
  subCategory?: string;
  phoneNumber?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
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

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';

export type ChurchEventType = 
  | 'WORSHIP' 
  | 'BIBLE_STUDY' 
  | 'PRAYER' 
  | 'OUTREACH' 
  | 'YOUTH' 
  | 'OTHER';

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: ChurchEventType;
  coordinator?: string;
  contactPerson?: string;
  rsvpDeadline?: string;
  coordinates?: { lat: number; lng: number };
  attendance: string[];
  recurrence?: RecurrenceType;
  reminderTime?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  scripture: string;
  event: string;
  eventId?: string;
  transcript?: string;
}

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
  | 'MY_PORTAL' 
  | 'MY_GIVING' 
  | 'PRIVACY' 
  | 'COMPLIANCE' 
  | 'SECURITY';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  date: string;
  status: string;
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
  status: 'Sent' | 'Scheduled' | 'Failed';
  sender: string;
  deliveryBreakdown?: {
    delivered: number;
    opened: number;
    failed: number;
  };
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
}

export interface SystemRole {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  custom?: boolean;
  modules: {
    id: string;
    label: string;
    enabled: boolean;
    permissions: {
      id: string;
      label: string;
      enabled: boolean;
      critical?: boolean;
    }[];
  }[];
}
