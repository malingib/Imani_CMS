import type { AppNotification, CommunicationLog, Member, MemberStatus, MaritalStatus, MembershipType, Transaction, TransactionType, ChurchEvent, ChurchEventType, AuditLog, Budget, RecurringExpense, Group, MemberActivity } from '../../types';
import type { AppView } from '../../types';
import type { MemberRow, TransactionRow, ChurchEventRow, BudgetRow, RecurringExpenseRow, CommunicationRow, NotificationRow, GroupRow, ActivityRow, AuditLogRow } from './database.types';

export function mapMember(r: MemberRow): Member {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone || '',
    email: r.email || '',
    location: r.location || '',
    groups: r.groups || [],
    status: (r.status as MemberStatus) || 'Active' as MemberStatus,
    joinDate: r.join_date || '',
    gender: (r.gender || undefined) as Member['gender'] | undefined,
    maritalStatus: r.marital_status as MaritalStatus || undefined,
    membershipType: r.membership_type as MembershipType || undefined,
    age: r.age || undefined,
    photo: r.photo || undefined,
    stewardshipScore: r.stewardship_score || undefined,
  };
}

export function mapTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    memberId: r.member_id || undefined,
    memberName: r.member_name || '',
    amount: r.amount,
    type: r.type as TransactionType,
    paymentMethod: r.payment_method as Transaction['paymentMethod'],
    date: r.date,
    reference: r.reference,
    category: r.category as Transaction['category'],
    notes: r.notes || undefined,
    phoneNumber: r.phone_number || undefined,
    source: (r.source || 'MANUAL') as Transaction['source'],
  };
}

export function mapEvent(r: ChurchEventRow): ChurchEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    time: r.time,
    location: r.location,
    type: r.type as ChurchEventType,
    coordinator: r.coordinator || undefined,
    attendance: r.attendance || [],
    contactPerson: r.contact_person || undefined,
    rsvpDeadline: r.rsvp_deadline || undefined,
    recurrence: (r.recurrence || undefined) as ChurchEvent['recurrence'],
  };
}

export function mapBudget(r: BudgetRow): Budget {
  return {
    id: r.id,
    category: r.category,
    amount: r.amount,
    spent: r.spent || 0,
    month: r.month,
  };
}

export function mapRecurringExpense(r: RecurringExpenseRow): RecurringExpense {
  return {
    id: r.id,
    category: r.category,
    amount: r.amount,
    frequency: r.frequency as RecurringExpense['frequency'],
    nextDate: r.next_date || '',
  };
}

export function mapCommunication(r: CommunicationRow): CommunicationLog {
  return {
    id: r.id,
    type: r.type as CommunicationLog['type'],
    recipientCount: r.recipient_count || 0,
    targetGroupName: r.target_group_name || '',
    subject: r.subject || '',
    content: r.content,
    date: r.date,
    status: (r.status || 'Sent') as CommunicationLog['status'],
    sender: r.sender || '',
    scheduledFor: r.scheduled_for || undefined,
    deliveryBreakdown: (r.delivery_breakdown as CommunicationLog['deliveryBreakdown']) || undefined,
  };
}

export function mapNotification(r: NotificationRow): AppNotification {
  return {
    id: r.id,
    title: r.title,
    message: r.message,
    time: r.time || '',
    type: r.type as AppNotification['type'],
    read: r.read || false,
  };
}

export function mapGroup(r: GroupRow): Group {
  return {
    id: r.id,
    name: r.name,
    description: r.description || '',
    memberCount: r.member_count || 0,
    churchId: r.church_id,
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
  };
}

export function mapActivity(r: ActivityRow): MemberActivity {
  return {
    id: r.id,
    memberId: r.member_id,
    type: r.type as MemberActivity['type'],
    description: r.description || '',
    timestamp: r.timestamp || r.created_at || '',
    metadata: r.metadata,
  };
}

export function mapAuditLog(r: AuditLogRow): AuditLog {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    action: r.action,
    module: r.module as AppView,
    timestamp: r.timestamp || new Date().toISOString(),
    severity: (r.severity as AuditLog['severity']) || 'INFO',
  };
}
