import { ClientStatus, OnboardingStatus, LeadSource, ProjectStatus, TaskStatus } from "@prisma/client";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ClientProjectSummary {
  id: string;
  name: string;
  serviceType: string;
  status: ProjectStatus;
  deadline: string | null;
}

export interface ClientTaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: UserSummary | null;
}

export interface OnboardingItem {
  id: string;
  clientId: string;
  status: OnboardingStatus;
  businessInfo?: string | null;
  contactInfo?: string | null;
  services?: string | null;
  startDate: string | null;
  targetEndDate?: string | null;
  completedAt: string | null;
  dealInfo?: string | null;
  documents?: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  clientCompanyName?: string | null;
}

export interface ClientItem {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  country?: string | null;
  website: string | null;
  industry: string | null;
  status: ClientStatus;
  source: LeadSource | null;
  assignedToId: string | null;
  assignedTo: UserSummary | null;
  assignedInternId?: string | null;
  assignedIntern?: UserSummary | null;
  convertedFromLeadId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  onboarding?: OnboardingItem | null;
  projects?: ClientProjectSummary[];
  tasks?: ClientTaskSummary[];
  // Co-Founder only financial summaries (STRICTLY OMITTED for Interns)
  financials?: {
    totalPayments: number;
    totalExpenses: number;
  };
}

export interface ClientFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  assignedToId?: string;
}

export interface OnboardingFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: OnboardingStatus;
}

export interface PaginatedClientsResponse {
  clients: ClientItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedOnboardingsResponse {
  onboardings: OnboardingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
