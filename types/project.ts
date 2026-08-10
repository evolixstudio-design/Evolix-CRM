import { ProjectServiceType, ProjectStatus, ProjectPriority, ProjectMemberRole, TaskStatus, PhaseStatus, PaymentStatus } from "@prisma/client";

export { PhaseStatus, PaymentStatus };

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
}

export interface ProjectMemberItem {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  user: UserSummary;
  createdAt: string;
}

export interface ProjectTaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  dueDate: string | null;
  assignedTo: UserSummary | null;
  phaseId?: string | null;
}

export interface ProjectPhaseItem {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentReceivedDate: string | null;
  invoiceId: string | null;
  invoiceNumber?: string | null;
  amountReceived?: number;
  amountPending?: number;
  status: PhaseStatus;
  progress: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
}

export interface ProjectItem {
  id: string;
  clientId: string;
  client: ClientSummary;
  name: string;
  description: string | null;
  serviceType: ProjectServiceType;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  deadline: string | null;
  completedAt: string | null;
  // Co-Founder only financial fields
  contractValue?: number | null;
  projectValue?: number;
  amountReceived?: number;
  amountPending?: number;
  currency: string;
  paymentStatus: PaymentStatus;
  contractType: string;
  duration: string | null;
  ownerId: string | null;
  owner: UserSummary | null;
  members: ProjectMemberItem[];
  phases?: ProjectPhaseItem[];
  tasks?: ProjectTaskSummary[];
  notes: string | null;
  progressPercentage: number;
  overallProgress: number;
  taskCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    members: number;
    phases: number;
  };
}

export interface ProjectFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  serviceType?: ProjectServiceType;
  clientId?: string;
  ownerId?: string;
}

export interface PaginatedProjectsResponse {
  projects: ProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
