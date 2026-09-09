export enum MemberStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  VISITOR = 'Visitor',
  YOUTH = 'Youth',
  DECEASED = 'Deceased',
  ARCHIVED = 'Archived'
}

export enum MaritalStatus {
  SINGLE = 'Single', MARRIED = 'Married', WIDOWED = 'Widowed', DIVORCED = 'Divorced'
}
export enum MembershipType {
  FULL = 'Full Member', PROBATION = 'Probation', ASSOCIATE = 'Associate', CLERGY = 'Clergy', NON_COMMUNICANT = 'Non-Communicant'
}
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', ADMIN = 'ADMIN', PASTOR = 'PASTOR', TREASURER = 'TREASURER', SECRETARY = 'SECRETARY', MEMBER = 'MEMBER'
}
export interface User { id:string; name:string; role:UserRole; avatar:string; memberId?:string; branch?:string; churchId?:string; }
export interface Member {
  id:string; firstName:string; lastName:string; phone:string; email:string; location:string; groups:string[];
  status:MemberStatus|'ACTIVE'; joinDate:string; birthday?:string; age?:number; gender?:'Male'|'Female'|'Other';
  maritalStatus?:MaritalStatus; membershipType?:MembershipType; photo?:string; stewardshipScore?:number;
}
export interface Household { id:string; churchId:string; name:string; address?:string; notes?:string; }
export interface MemberFollowUp { id:string; churchId:string; memberId:string; type:string; status:'OPEN'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'; dueDate?:string; notes?:string; }
export interface MemberStatusHistory { id:string; churchId:string; memberId:string; fromStatus?:string; toStatus:string; reason?:string; changedAt:string; changedBy?:string; }
export interface MemberAttendanceSummary { memberId:string; attendedEvents:number; trackedEvents:number; attendanceRate:number; lastAttendanceDate?:string; }
export type TransactionType = 'Tithe'|'Offering'|'Project'|'Harambee'|'Benevolence'|'Expense'|'Salary'|'Utility'|'Maintenance';
export interface Transaction {
  id:string; memberId?:string; memberName:string; amount:number; type:TransactionType;
  paymentMethod:'M-Pesa'|'Cash'|'Bank Transfer'|'Cheque'; date:string; reference:string; category:'Income'|'Expense';
  notes?:string; phoneNumber?:string; source:'MANUAL'|'INTEGRATED'; fundId?:string; projectId?:string;
}
export interface Fund { id:string; churchId:string; name:string; code:string; description?:string; active:boolean; }
export interface ChurchProject { id:string; churchId:string; name:string; accountPrefix:string; description?:string; targetAmount:number; active:boolean; startDate?:string; endDate?:string; }
export interface Expense { id:string; churchId:string; transactionId?:string; category:string; description:string; amount:number; expenseDate:string; vendor?:string; receiptReference?:string; status:'RECORDED'|'PENDING'|'VOID'; createdBy?:string; }
export interface FinancialAuditLog { id:string; churchId:string; actorId?:string; action:string; entityType:string; entityId?:string; amount?:number; metadata?:Record<string,unknown>; createdAt:string; }
export interface StewardshipPledge { id:string; memberId:string; category:TransactionType; targetAmount:number; period:'Monthly'|'Yearly'; startDate:string; status:'ACTIVE'|'FULFILLED'|'CANCELLED'; }
export interface MemberActivity { id:string; memberId:string; type:'PAYMENT'|'EVENT_RSVP'|'PROFILE_UPDATE'|'GROUP_JOIN'; description:string; timestamp:string; metadata?:any; }
export interface Budget { id:string; category:string; amount:number; spent:number; month:string; }
export interface AuditLog { id:string; userId:string; userName:string; action:string; module:AppView; timestamp:string; severity:'INFO'|'WARN'|'CRITICAL'; metadata?:any; }
export type ChurchEventType='WORSHIP'|'BIBLE_STUDY'|'PRAYER'|'OUTREACH'|'YOUTH'|'OTHER';
export type RecurrenceType='NONE'|'DAILY'|'WEEKLY'|'MONTHLY'|'ANNUALLY';
export interface ChurchEvent { id:string; title:string; description:string; date:string; time:string; location:string; type:ChurchEventType; coordinator?:string; attendance:string[]; contactPerson?:string; rsvpDeadline?:string; recurrence?:RecurrenceType; coordinates?:{lat:number;lng:number}; }
export interface AppNotification { id:string; title:string; message:string; time:string; type:'SYSTEM'|'MPESA'|'MEMBER'|'EVENT'; read:boolean; }
export type AppView='DASHBOARD'|'MEMBERS'|'FINANCE'|'GROUPS'|'EVENTS'|'COMMUNICATION'|'REPORTS'|'SERMONS'|'ANALYTICS'|'SETTINGS'|'AUDIT_LOGS'|'BILLING'|'MY_PORTAL'|'MY_GIVING'|'PRIVACY'|'COMPLIANCE'|'SECURITY'|'PLATFORM_DASHBOARD'|'TENANTS'|'INVITATIONS'|'PLATFORM_SETTINGS';
export interface Toast { id:string; message:string; type:'success'|'error'|'info'; }
export interface Tenant { id:string; name:string; subdomain:string; plan:'Basic'|'Pro'|'Enterprise'; status:'Active'|'Suspended'|'Trialing'|'Past Due'; ownerEmail:string; region:string; memberCount:number; mrr:number; renewalDate:string; healthScore:number; usageMetrics?:{cpu:number;memory:number;dbConnections:number;smsSent:number}; }
export interface SupportTicket { id:string; tenantName:string; subject:string; description:string; status:'Open'|'Pending'|'Resolved'; priority:'Low'|'Medium'|'High'|'Critical'; createdAt:string; lastUpdate:string; }
export interface CommunicationLog { id:string; type:'SMS'|'Email'|'WhatsApp'; recipientCount:number; targetGroupName:string; subject:string; content:string; date:string; status:'Sent'|'Scheduled'|'Failed'; sender:string; scheduledFor?:string; deliveryBreakdown?:{delivered:number;opened:number;failed:number}; }
export interface CommunicationTemplate { id:string; name:string; content:string; type:'SMS'|'Email'|'WhatsApp'; subject?:string; }
export interface SystemRole { id:string; name:string; memberCount:number; description:string; modules:string[]; }
export interface RecurringExpense { id:string; category:string; amount:number; frequency:'Weekly'|'Monthly'|'Quarterly'|'Yearly'; nextDate:string; }
export interface Sermon { id:string; title:string; speaker:string; date:string; time:string; scripture:string; event:string; eventId:string; transcript:string; }
export interface Group { id:string; name:string; description:string; memberCount:number; churchId?:string; createdAt:string; updatedAt:string; }
