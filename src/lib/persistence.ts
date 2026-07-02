import { supabase } from "./supabase";
import { mapActivity, mapBudget, mapCommunication, mapEvent, mapGroup, mapMember, mapNotification, mapRecurringExpense, mapTransaction } from "./mappers";
import type { AppNotification, Budget, ChurchEvent, CommunicationLog, Group, Member, MemberActivity, RecurringExpense, Transaction } from "../../types";

const isUuid = (value: string | undefined) =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function memberToRow(member: Member, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(member.id) ? { id: member.id } : {}),
    church_id: churchId,
    first_name: member.firstName,
    last_name: member.lastName,
    phone: member.phone,
    email: member.email,
    location: member.location,
    groups: member.groups || [],
    status: member.status,
    join_date: member.joinDate,
    birthday: member.birthday,
    age: member.age,
    gender: member.gender,
    marital_status: member.maritalStatus,
    membership_type: member.membershipType,
    photo: member.photo,
    stewardship_score: member.stewardshipScore,
  };
}

export function transactionToRow(transaction: Transaction, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(transaction.id) ? { id: transaction.id } : {}),
    church_id: churchId,
    member_id: isUuid(transaction.memberId) ? transaction.memberId : null,
    member_name: transaction.memberName,
    amount: transaction.amount,
    type: transaction.type,
    payment_method: transaction.paymentMethod,
    date: transaction.date,
    reference: transaction.reference,
    category: transaction.category,
    notes: transaction.notes,
    phone_number: transaction.phoneNumber,
    source: transaction.source,
  };
}

export function eventToRow(event: ChurchEvent, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(event.id) ? { id: event.id } : {}),
    church_id: churchId,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    type: event.type,
    coordinator: event.coordinator,
    contact_person: event.contactPerson,
    rsvp_deadline: event.rsvpDeadline,
    recurrence: event.recurrence || "NONE",
  };
}

export async function createMember(member: Member, churchId: string) {
  const { data, error } = await supabase
    .from("members")
    .insert(memberToRow(member, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapMember(data);
}

export async function createMembers(members: Member[], churchId: string) {
  const rows = members.map((member) => memberToRow(member, churchId));
  const { data, error } = await supabase.from("members").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return (data || []).map(mapMember);
}

export async function updateMember(member: Member, churchId: string) {
  const { data, error } = await supabase
    .from("members")
    .update(memberToRow(member, churchId))
    .eq("id", member.id)
    .eq("church_id", churchId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapMember(data);
}

export async function deleteMember(id: string, churchId: string) {
  const { error } = await supabase.from("members").delete().eq("id", id).eq("church_id", churchId);
  if (error) throw new Error(error.message);
}

export async function createTransaction(transaction: Transaction, churchId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionToRow(transaction, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapTransaction(data);
}

export async function updateTransaction(transaction: Transaction, churchId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .update(transactionToRow(transaction, churchId))
    .eq("id", transaction.id)
    .eq("church_id", churchId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapTransaction(data);
}

export async function deleteTransaction(id: string, churchId: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("church_id", churchId);
  if (error) throw new Error(error.message);
}

export async function createEvent(event: ChurchEvent, churchId: string) {
  const { data, error } = await supabase
    .from("church_events")
    .insert(eventToRow(event, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { ...mapEvent(data), attendance: [] };
}

export async function deleteEvent(id: string, churchId: string) {
  const { error } = await supabase.from("church_events").delete().eq("id", id).eq("church_id", churchId);
  if (error) throw new Error(error.message);
}

export async function replaceEventAttendance(eventId: string, memberIds: string[], churchId: string) {
  const { error: deleteError } = await supabase.from("event_attendance").delete().eq("event_id", eventId).eq("church_id", churchId);
  if (deleteError) throw new Error(deleteError.message);

  if (memberIds.length === 0) return;

  const { error } = await supabase.from("event_attendance").insert(
    memberIds.map((memberId) => ({
      event_id: eventId,
      member_id: memberId,
      church_id: churchId,
    }))
  );
  if (error) throw new Error(error.message);
}

export function budgetToRow(budget: Budget, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(budget.id) ? { id: budget.id } : {}),
    church_id: churchId,
    category: budget.category,
    amount: budget.amount,
    spent: budget.spent,
    month: budget.month,
  };
}

export function recurringExpenseToRow(expense: RecurringExpense, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(expense.id) ? { id: expense.id } : {}),
    church_id: churchId,
    category: expense.category,
    amount: expense.amount,
    frequency: expense.frequency,
    next_date: expense.nextDate,
  };
}

export async function createBudget(budget: Budget, churchId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .insert(budgetToRow(budget, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapBudget(data);
}

export async function updateBudget(budget: Budget, churchId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .update(budgetToRow(budget, churchId, true))
    .eq("id", budget.id)
    .eq("church_id", churchId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapBudget(data);
}

export async function createRecurringExpense(expense: RecurringExpense, churchId: string) {
  const { data, error } = await supabase
    .from("recurring_expenses")
    .insert(recurringExpenseToRow(expense, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapRecurringExpense(data);
}

export function communicationToRow(log: CommunicationLog, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(log.id) ? { id: log.id } : {}),
    church_id: churchId,
    type: log.type,
    recipient_count: log.recipientCount,
    target_group_name: log.targetGroupName,
    subject: log.subject,
    content: log.content,
    date: log.date,
    status: log.status,
    sender: log.sender,
    scheduled_for: log.scheduledFor,
    delivery_breakdown: log.deliveryBreakdown,
  };
}

export function notificationToRow(notification: AppNotification, churchId: string) {
  return {
    church_id: churchId,
    title: notification.title,
    message: notification.message,
    time: notification.time,
    type: notification.type,
    read: notification.read,
  };
}

export async function createCommunication(log: CommunicationLog, churchId: string) {
  const { data, error } = await supabase
    .from("communications")
    .insert(communicationToRow(log, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapCommunication(data);
}

export async function createNotification(notification: AppNotification, churchId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .insert(notificationToRow(notification, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapNotification(data);
}

export async function updateNotificationRead(id: string, read: boolean, churchId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read })
    .eq("id", id)
    .eq("church_id", churchId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapNotification(data);
}

export async function markAllNotificationsRead(churchId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("church_id", churchId)
    .eq("read", false);
  if (error) throw new Error(error.message);
}

export async function deleteNotification(id: string, churchId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("church_id", churchId);
  if (error) throw new Error(error.message);
}

// ── Groups ──────────────────────────────────────────────

export function groupToRow(group: Group, churchId: string, includeId = false) {
  return {
    ...(includeId && isUuid(group.id) ? { id: group.id } : {}),
    church_id: churchId,
    name: group.name,
    description: group.description,
    member_count: group.memberCount,
  };
}

export async function createGroup(group: Group, churchId: string) {
  const { data, error } = await supabase
    .from("groups")
    .insert(groupToRow(group, churchId))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapGroup(data);
}

export async function getGroups(churchId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("church_id", churchId)
    .order("name");
  if (error) throw new Error(error.message);
  return (data || []).map(mapGroup);
}

export async function getGroup(id: string, churchId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .eq("church_id", churchId)
    .single();
  if (error) throw new Error(error.message);
  return mapGroup(data);
}

export async function updateGroup(group: Group, churchId: string) {
  const { data, error } = await supabase
    .from("groups")
    .update(groupToRow(group, churchId, true))
    .eq("id", group.id)
    .eq("church_id", churchId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapGroup(data);
}

export async function deleteGroup(id: string, churchId: string) {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("church_id", churchId);
  if (error) throw new Error(error.message);
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select("member_id")
    .eq("group_id", groupId);
  if (error) throw new Error(error.message);
  return (data || []).map((r: any) => r.member_id as string);
}

export async function addGroupMember(groupId: string, memberId: string, churchId: string) {
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, member_id: memberId, church_id: churchId });
  if (error) throw new Error(error.message);
}

export async function removeGroupMember(groupId: string, memberId: string) {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("member_id", memberId);
  if (error) throw new Error(error.message);
}

// ── Activities ──────────────────────────────────────────

export async function getActivities(memberId: string, churchId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("member_id", memberId)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data || []).map(mapActivity);
}

// ── Platform Settings ───────────────────────────────────

export async function getPlatformSetting(category: string, key: string) {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("flags")
    .eq("id", "global")
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data?.flags?.[category]?.[key] ?? null;
}

export async function setPlatformSetting(category: string, key: string, value: unknown) {
  const { data: current, error: currentError } = await supabase
    .from("platform_settings")
    .select("flags")
    .eq("id", "global")
    .single();
  if (currentError && currentError.code !== "PGRST116") throw new Error(currentError.message);

  const flags = { ...(current?.flags || {}) };
  const categoryFlags = { ...((flags[category] as Record<string, unknown>) || {}) };
  categoryFlags[key] = value;
  flags[category] = categoryFlags;

  const { error } = await supabase
    .from("platform_settings")
    .upsert({ id: "global", flags }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}
