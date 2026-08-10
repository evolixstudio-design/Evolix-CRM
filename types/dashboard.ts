import { UserRole } from "@/types";

export interface TeamMemberWorkload {
  userId: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  activeTasks: number;
  overdueTasks: number;
  activeProjects: number;
}

export interface CoFounderBusinessMetrics {
  totalLeads: number;
  newLeads: number;
  leadConversionRate: number; // percentage
  activeClients: number;
  activeProjects: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface CoFounderFinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  pendingPayments: number;
}

export interface CoFounderDashboardData {
  role: "CO_FOUNDER";
  business: CoFounderBusinessMetrics;
  finance: CoFounderFinancialMetrics;
  teamWorkload: TeamMemberWorkload[];
}

export interface InternOperationalMetrics {
  myTasksCount: number;
  pendingTasksCount: number;
  todaysTasksCount: number;
  overdueTasksCount: number;
  completedTasksCount: number;
  myClientsCount: number;
  myProjectsCount: number;
  taskProgressPercentage: number;
}

export interface InternNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export interface InternDashboardData {
  role: "INTERN";
  operational: InternOperationalMetrics;
  notifications: InternNotificationItem[];
}

export type DashboardData = CoFounderDashboardData | InternDashboardData;

export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: {
    code: string;
    message: string;
  };
}
