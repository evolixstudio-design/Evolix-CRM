import {
  LeadStatus,
  LeadPriority,
  LeadSource,
  LeadActivityType,
} from "@prisma/client";

export enum CallOutcome {
  CONNECTED = "CONNECTED",
  NOT_CONNECTED = "NOT_CONNECTED",
  BUSY = "BUSY",
  CALL_BACK = "CALL_BACK",
  INTERESTED = "INTERESTED",
  NOT_INTERESTED = "NOT_INTERESTED",
  WRONG_NUMBER = "WRONG_NUMBER",
  MEETING_FIXED = "MEETING_FIXED",
  OTHER = "OTHER",
}

export enum FollowUpType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  MEETING = "MEETING",
  OTHER = "OTHER",
}

export interface LeadUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface LeadActivityItem {
  id: string;
  leadId: string;
  userId: string;
  type: LeadActivityType;
  content: string | null;
  metadata?: any;
  createdAt: string;
  user: LeadUserSummary;
}

export interface LeadFollowUpItem {
  id: string;
  leadId: string;
  lead?: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
  };
  type: FollowUpType;
  notes: string | null;
  dueDate: string;
  assignedToId: string | null;
  assignedTo: LeadUserSummary | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdById: string;
  createdBy: LeadUserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface LeadItem {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  service: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue: number | null;
  assignedToId: string | null;
  assignedTo: LeadUserSummary | null;
  nextFollowUpAt: string | null;
  notes: string | null;
  convertedAt: string | null;
  convertedClient?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
    followUps?: number;
  };
}

export interface LeadFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
}

export interface PaginatedLeadsResponse {
  leads: LeadItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FollowUpFilterOptions {
  page?: number;
  limit?: number;
  view?: "today" | "overdue" | "upcoming" | "completed" | "all";
  assignedToId?: string;
  leadId?: string;
}

export interface FollowUpWorkAreaSummary {
  todayCount: number;
  overdueCount: number;
  upcomingCount: number;
  completedTodayCount: number;
}
