import type { Member, MemberStatus, MaritalStatus, MembershipType, Transaction, ChurchEvent, AuditLog } from '../../types';
import type { AppView } from '../../types';

export function mapMember(r: any): Member {
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
    gender: r.gender || undefined,
    maritalStatus: r.marital_status as MaritalStatus || undefined,
    membershipType: r.membership_type as MembershipType || undefined,
    age: r.age || undefined,
    photo: r.photo || undefined,
    stewardshipScore: r.stewardship_score || undefined,
  };
}

export function mapTransaction(r: any): Transaction {
  return {
    id: r.id,
    memberId: r.member_id || undefined,
    memberName: r.member_name || '',
    amount: r.amount,
    type: r.type,
    paymentMethod: r.payment_method,
    date: r.date,
    reference: r.reference,
    category: r.category,
    notes: r.notes || undefined,
    phoneNumber: r.phone_number || undefined,
    source: r.source || 'MANUAL',
  };
}

export function mapEvent(r: any): ChurchEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    time: r.time,
    location: r.location,
    type: r.type,
    coordinator: r.coordinator || undefined,
    attendance: r.attendance || [],
    contactPerson: r.contact_person || undefined,
    rsvpDeadline: r.rsvp_deadline || undefined,
  };
}

export function mapAuditLog(r: any): AuditLog {
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
