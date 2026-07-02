import { supabase } from "./supabase";
import { mapEvent, mapMember, mapTransaction } from "./mappers";
import type { ChurchEvent, Member, Transaction } from "../../types";

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
