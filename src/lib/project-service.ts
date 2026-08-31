import { supabase } from './supabase';
import type { Project, ProjectAccount, ChurchPaymentAccount } from '../../types/projects';

const mapProject = (row: any): Project => ({
  id: row.id,
  churchId: row.church_id,
  name: row.name,
  code: row.code || undefined,
  description: row.description || undefined,
  category: row.category,
  targetAmount: Number(row.target_amount || 0),
  startDate: row.start_date || undefined,
  targetDate: row.target_date || undefined,
  status: row.status,
  accountPrefix: row.account_prefix || undefined,
  publicVisibility: !!row.public_visibility,
  allowContributions: !!row.allow_contributions,
  imageUrl: row.image_url || undefined,
  createdBy: row.created_by || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function listProjects(churchId: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('church_id', churchId).order('created_at', { ascending: false });
  return { data: (data || []).map(mapProject), error };
}

export async function createProject(input: {
  churchId: string;
  userId?: string;
  name: string;
  code?: string;
  description?: string;
  category: string;
  targetAmount: number;
  startDate?: string;
  targetDate?: string;
  status?: Project['status'];
  accountPrefix?: string;
  publicVisibility?: boolean;
  allowContributions?: boolean;
}) {
  const { data, error } = await supabase.from('projects').insert({
    church_id: input.churchId,
    created_by: input.userId || null,
    name: input.name.trim(),
    code: input.code?.trim() || null,
    description: input.description?.trim() || null,
    category: input.category,
    target_amount: input.targetAmount,
    start_date: input.startDate || null,
    target_date: input.targetDate || null,
    status: input.status || 'ACTIVE',
    account_prefix: input.accountPrefix?.trim().toUpperCase() || null,
    public_visibility: input.publicVisibility ?? true,
    allow_contributions: input.allowContributions ?? true,
  }).select('*').single();
  return { data: data ? mapProject(data) : null, error };
}

export async function updateProject(projectId: string, churchId: string, patch: Partial<Parameters<typeof createProject>[0]>) {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name.trim();
  if (patch.code !== undefined) payload.code = patch.code?.trim() || null;
  if (patch.description !== undefined) payload.description = patch.description?.trim() || null;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.targetAmount !== undefined) payload.target_amount = patch.targetAmount;
  if (patch.startDate !== undefined) payload.start_date = patch.startDate || null;
  if (patch.targetDate !== undefined) payload.target_date = patch.targetDate || null;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.accountPrefix !== undefined) payload.account_prefix = patch.accountPrefix?.trim().toUpperCase() || null;
  if (patch.publicVisibility !== undefined) payload.public_visibility = patch.publicVisibility;
  if (patch.allowContributions !== undefined) payload.allow_contributions = patch.allowContributions;

  const { data, error } = await supabase.from('projects').update(payload).eq('id', projectId).eq('church_id', churchId).select('*').single();
  return { data: data ? mapProject(data) : null, error };
}

export async function archiveProject(projectId: string, churchId: string) {
  return updateProject(projectId, churchId, { status: 'ARCHIVED' });
}

export async function listProjectAccounts(churchId: string) {
  const { data, error } = await supabase.from('project_accounts').select('*').eq('church_id', churchId).eq('active', true).order('account_prefix');
  return {
    data: (data || []).map((row: any): ProjectAccount => ({
      id: row.id, churchId: row.church_id, projectId: row.project_id,
      accountPrefix: row.account_prefix, displayName: row.display_name || undefined,
      active: row.active, createdAt: row.created_at, updatedAt: row.updated_at,
    })), error,
  };
}

export async function listChurchPaymentAccounts(churchId: string) {
  const { data, error } = await supabase.from('church_payment_accounts').select('*').eq('church_id', churchId).eq('active', true);
  return {
    data: (data || []).map((row: any): ChurchPaymentAccount => ({
      id: row.id, churchId: row.church_id, provider: row.provider, accountType: row.account_type,
      paybillNumber: row.paybill_number, displayName: row.display_name || undefined,
      active: row.active, createdAt: row.created_at, updatedAt: row.updated_at,
    })), error,
  };
}

export async function resolveProjectAccount(churchId: string, accountPrefix: string) {
  const normalized = accountPrefix.trim().toUpperCase();
  if (!normalized) return { data: null, error: null };
  const { data, error } = await supabase.from('project_accounts').select('*').eq('church_id', churchId).eq('account_prefix', normalized).eq('active', true).maybeSingle();
  return {
    data: data ? {
      id: data.id, churchId: data.church_id, projectId: data.project_id,
      accountPrefix: data.account_prefix, displayName: data.display_name || undefined,
      active: data.active, createdAt: data.created_at, updatedAt: data.updated_at,
    } as ProjectAccount : null,
    error,
  };
}
