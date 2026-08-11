import { TaskStatus, TaskPriority } from "@prisma/client";

export { TaskStatus, TaskPriority };

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
}

export interface ProjectSummary {
  id: string;
  name: string;
  serviceType: string;
}

export interface PhaseSummary {
  id: string;
  name: string;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  userId: string;
  user: UserSummary;
  content: string;
  createdAt: string;
}

export interface TaskAttachmentItem {
  id: string;
  taskId: string;
  uploadedById: string;
  uploadedBy: UserSummary;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
}

export interface SubtaskItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  project: ProjectSummary;
  clientId: string;
  client: ClientSummary;
  phaseId?: string | null;
  phase?: PhaseSummary | null;
  assignedToId: string | null;
  assignedTo: UserSummary | null;
  assignedInternId?: string | null;
  assignedIntern?: UserSummary | null;
  createdById: string;
  createdBy: UserSummary;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  declineReason?: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: TaskCommentItem[];
  attachments?: TaskAttachmentItem[];
  subtasks?: SubtaskItem[];
}

export interface TaskFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  phaseId?: string;
  clientId?: string;
  assignedToId?: string;
  assignedInternId?: string;
  myTasksOnly?: boolean;
}

export interface PaginatedTasksResponse {
  tasks: TaskItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkboardDataSummary {
  assignedCount: number;
  acceptedCount: number;
  declinedCount: number;
  inProgressCount: number;
  submittedCount: number;
  completedCount: number;
  overdueCount: number;
}
