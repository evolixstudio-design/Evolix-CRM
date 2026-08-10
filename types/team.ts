import { UserRole } from "@prisma/client";

export interface TeamWorkloadSummary {
  activeProjectsCount: number;
  activeTasksCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
}

export interface TeamProjectSummary {
  id: string;
  name: string;
  serviceType: string;
  status: string;
}

export interface TeamTaskSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  workload: TeamWorkloadSummary;
  projects?: TeamProjectSummary[];
  tasks?: TeamTaskSummary[];
}

export interface InternCreateInput {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  password?: string;
  role: UserRole; // Must be INTERN
  isActive?: boolean;
}

export interface TeamMemberUpdateInput {
  name?: string;
  phone?: string;
  department?: string;
  isActive?: boolean;
  role?: UserRole;
}
