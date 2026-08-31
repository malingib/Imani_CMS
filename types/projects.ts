export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type ProjectCategory = 'CONSTRUCTION' | 'RENOVATION' | 'MAINTENANCE' | 'EQUIPMENT' | 'OUTREACH' | 'MISSION' | 'WELFARE' | 'YOUTH' | 'CHILDREN' | 'OTHER';

export interface Project {
  id: string;
  churchId: string;
  name: string;
  code?: string;
  description?: string;
  category: ProjectCategory | string;
  targetAmount: number;
  startDate?: string;
  targetDate?: string;
  status: ProjectStatus;
  accountPrefix?: string;
  publicVisibility: boolean;
  allowContributions: boolean;
  imageUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  raisedAmount?: number;
  expenseAmount?: number;
  contributorCount?: number;
  contributionCount?: number;
}

export interface ProjectAccount {
  id: string;
  churchId: string;
  projectId: string;
  accountPrefix: string;
  displayName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchPaymentAccount {
  id: string;
  churchId: string;
  provider: string;
  accountType: string;
  paybillNumber: string;
  displayName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
