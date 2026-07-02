export interface MemberRow {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string | null;
  groups: string[] | null;
  status: string;
  join_date: string | null;
  birthday: string | null;
  age: number | null;
  gender: string | null;
  marital_status: string | null;
  membership_type: string | null;
  photo: string | null;
  stewardship_score: number | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface TransactionRow {
  id: string;
  member_id: string | null;
  member_name: string | null;
  amount: number;
  type: string;
  payment_method: string | null;
  date: string;
  reference: string | null;
  category: string;
  notes: string | null;
  phone_number: string | null;
  source: string;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface ChurchEventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: string;
  coordinator: string | null;
  contact_person: string | null;
  rsvp_deadline: string | null;
  recurrence: string;
  attendance?: string[];
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface EventAttendanceRow {
  event_id: string;
  member_id: string;
  church_id: string | null;
}

export interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface GroupMemberRow {
  group_id: string;
  member_id: string;
  church_id: string | null;
}

export interface CommunicationRow {
  id: string;
  type: string;
  recipient_count: number | null;
  target_group_name: string | null;
  subject: string | null;
  content: string;
  date: string;
  status: string;
  sender: string | null;
  scheduled_for: string | null;
  delivery_breakdown: unknown | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface ActivityRow {
  id: string;
  member_id: string | null;
  type: string;
  description: string | null;
  timestamp: string | null;
  metadata: unknown | null;
  tenant_id: string | null;
  created_at: string | null;
  church_id: string | null;
}

export interface BudgetRow {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface RecurringExpenseRow {
  id: string;
  category: string;
  amount: number;
  frequency: string;
  next_date: string | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface SermonRow {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string | null;
  scripture: string | null;
  event: string | null;
  event_id: string | null;
  transcript: string | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  church_id: string | null;
}

export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  time: string | null;
  type: string;
  read: boolean;
  tenant_id: string | null;
  created_at: string | null;
  church_id: string | null;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  module: string;
  timestamp: string | null;
  severity: string;
  metadata: unknown | null;
  tenant_id: string | null;
  church_id: string | null;
}

export interface ChurchRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tier: string;
  status: string;
  created_at: string | null;
}

export interface SubscriptionRow {
  id: string;
  church_id: string;
  tier: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
}

export interface InvoiceRow {
  id: string;
  church_id: string;
  subscription_id: string | null;
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  created_at: string | null;
}

export interface InvitationRow {
  id: string;
  church_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string | null;
}

export interface PlatformSettingRow {
  id: string;
  flags: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserRow {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown> | null;
  app_metadata: Record<string, unknown> | null;
}
