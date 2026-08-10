import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { AuthUser } from "@/types";

export interface CoFounderReportsData {
  sales: {
    totalLeads: number;
    qualifiedLeads: number;
    wonLeads: number;
    lostLeads: number;
    conversionRate: number;
    estimatedPipelineValue: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
  clients: {
    totalClients: number;
    activeClients: number;
    onboardingClients: number;
    completedClients: number;
    newClientsThisMonth: number;
    byStatus: Record<string, number>;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    overdueProjects: number;
    completionRate: number;
    byStatus: Record<string, number>;
    byServiceType: Record<string, number>;
  };
  tasks: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  };
  teamWorkload: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    avatarUrl: string | null;
    role: string;
    totalAssignedTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    assignedProjectsCount: number;
  }>;
  financials: {
    revenue: number;
    pendingPayments: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
}

export interface InternReportsData {
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeCompletionRate: number;
  assignedProjectsCount: number;
  assignedProjects: Array<{
    id: string;
    name: string;
    status: string;
    serviceType: string;
    deadline: string | null;
    completedTasksCount: number;
    totalTasksCount: number;
  }>;
}

export type ReportsResponseData =
  | { role: "CO_FOUNDER"; data: CoFounderReportsData }
  | { role: "INTERN"; data: InternReportsData };

/**
 * Main Entry Point for Reports Service
 * Performs role branching before executing queries.
 */
export async function getReportsData(user: AuthUser): Promise<ReportsResponseData> {
  if (!user || !user.isActive) {
    throw AppError.unauthorized("Active authentication required.");
  }

  if (user.role === "CO_FOUNDER") {
    const data = await getCoFounderReportsData();
    return { role: "CO_FOUNDER", data };
  } else if (user.role === "INTERN") {
    const data = await getInternReportsData(user.id);
    return { role: "INTERN", data };
  } else {
    throw AppError.forbidden("Unrecognized user role.");
  }
}

/**
 * Co-Founder Reports Database Aggregation
 */
async function getCoFounderReportsData(): Promise<CoFounderReportsData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    qualifiedLeads,
    wonLeads,
    lostLeads,
    leadsByStatusGroup,
    leadsBySourceGroup,
    leadPipelineAgg,
    totalClients,
    activeClients,
    onboardingClients,
    completedClients,
    newClientsThisMonth,
    clientsByStatusGroup,
    totalProjects,
    activeProjects,
    completedProjects,
    overdueProjects,
    projectsByStatusGroup,
    projectsByServiceGroup,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksByStatusGroup,
    tasksByPriorityGroup,
    teamUsers,
    paidPaymentsAgg,
    pendingPaymentsAgg,
    expensesAgg,
  ] = await Promise.all([
    // Sales / Leads
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "QUALIFIED" } }),
    prisma.lead.count({ where: { status: "WON" } }),
    prisma.lead.count({ where: { status: "LOST" } }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.lead.groupBy({ by: ["source"], _count: { id: true } }),
    prisma.lead.aggregate({ _sum: { estimatedValue: true } }),

    // Clients
    prisma.client.count(),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.client.count({ where: { status: "ONBOARDING" } }),
    prisma.client.count({ where: { status: "COMPLETED" } }),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.client.groupBy({ by: ["status"], _count: { id: true } }),

    // Projects
    prisma.project.count(),
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.project.count({
      where: {
        deadline: { lt: now },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    prisma.project.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.project.groupBy({ by: ["serviceType"], _count: { id: true } }),

    // Tasks
    prisma.task.count(),
    prisma.task.count({ where: { status: "COMPLETED" } }),
    prisma.task.count({ where: { status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"] } } }),
    prisma.task.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    prisma.task.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.task.groupBy({ by: ["priority"], _count: { id: true } }),

    // Team Workload
    prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        assignedTasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          },
        },
        projectMemberships: {
          select: { projectId: true },
        },
        ownedProjects: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),

    // Financials
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
  ]);

  // Lead Maps
  const leadsByStatus: Record<string, number> = {};
  leadsByStatusGroup.forEach((g) => {
    leadsByStatus[g.status] = g._count.id;
  });
  const leadsBySource: Record<string, number> = {};
  leadsBySourceGroup.forEach((g) => {
    leadsBySource[g.source] = g._count.id;
  });

  // Client Maps
  const clientsByStatus: Record<string, number> = {};
  clientsByStatusGroup.forEach((g) => {
    clientsByStatus[g.status] = g._count.id;
  });

  // Project Maps
  const projectsByStatus: Record<string, number> = {};
  projectsByStatusGroup.forEach((g) => {
    projectsByStatus[g.status] = g._count.id;
  });
  const projectsByServiceType: Record<string, number> = {};
  projectsByServiceGroup.forEach((g) => {
    projectsByServiceType[g.serviceType] = g._count.id;
  });

  // Task Maps
  const tasksByStatus: Record<string, number> = {};
  tasksByStatusGroup.forEach((g) => {
    tasksByStatus[g.status] = g._count.id;
  });
  const tasksByPriority: Record<string, number> = {};
  tasksByPriorityGroup.forEach((g) => {
    tasksByPriority[g.priority] = g._count.id;
  });

  // Calculations
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;
  const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 1000) / 10 : 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  // Team Workload calculation
  const teamWorkload = teamUsers.map((u) => {
    const totalAssigned = u.assignedTasks.length;
    const completed = u.assignedTasks.filter((t) => t.status === "COMPLETED").length;
    const pending = u.assignedTasks.filter((t) => ["TODO", "IN_PROGRESS", "IN_REVIEW"].includes(t.status)).length;
    const overdue = u.assignedTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && !["COMPLETED", "CANCELLED"].includes(t.status)
    ).length;
    const rate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    const uniqueProjectIds = new Set([
      ...u.ownedProjects.map((p) => p.id),
      ...u.projectMemberships.map((pm) => pm.projectId),
    ]);

    return {
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      avatarUrl: u.avatarUrl,
      role: u.role,
      totalAssignedTasks: totalAssigned,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionRate: rate,
      assignedProjectsCount: uniqueProjectIds.size,
    };
  });

  const revenue = Number(paidPaymentsAgg._sum.amount || 0);
  const pendingPayments = Number(pendingPaymentsAgg._sum.amount || 0);
  const expenses = Number(expensesAgg._sum.amount || 0);
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

  return {
    sales: {
      totalLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      estimatedPipelineValue: Number(leadPipelineAgg._sum.estimatedValue || 0),
      byStatus: leadsByStatus,
      bySource: leadsBySource,
    },
    clients: {
      totalClients,
      activeClients,
      onboardingClients,
      completedClients,
      newClientsThisMonth,
      byStatus: clientsByStatus,
    },
    projects: {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      completionRate: projectCompletionRate,
      byStatus: projectsByStatus,
      byServiceType: projectsByServiceType,
    },
    tasks: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: taskCompletionRate,
      byPriority: tasksByPriority,
      byStatus: tasksByStatus,
    },
    teamWorkload,
    financials: {
      revenue,
      pendingPayments,
      expenses,
      profit,
      profitMargin,
    },
  };
}

/**
 * Intern Reports Database Aggregation
 * Returns strictly personal operational data with NO financial properties.
 */
async function getInternReportsData(userId: string): Promise<InternReportsData> {
  const now = new Date();

  const [completedTasks, pendingTasks, overdueTasks, allMyTasks, myProjects] = await Promise.all([
    prisma.task.count({
      where: { assignedToId: userId, status: "COMPLETED" },
    }),
    prisma.task.count({
      where: {
        assignedToId: userId,
        status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    prisma.task.count({
      where: {
        assignedToId: userId,
        dueDate: { lt: now },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    prisma.task.findMany({
      where: { assignedToId: userId },
      select: {
        status: true,
        dueDate: true,
        completedAt: true,
      },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { tasks: { some: { assignedToId: userId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        serviceType: true,
        deadline: true,
        tasks: {
          where: { assignedToId: userId },
          select: { id: true, status: true },
        },
      },
    }),
  ]);

  const totalMyTasks = allMyTasks.length;
  const completionRate = totalMyTasks > 0 ? Math.round((completedTasks / totalMyTasks) * 100) : 0;

  const completedTaskList = allMyTasks.filter((t) => t.status === "COMPLETED");
  const onTimeCompletedCount = completedTaskList.filter((t) => {
    if (!t.dueDate) return true;
    if (!t.completedAt) return false;
    return new Date(t.completedAt) <= new Date(t.dueDate);
  }).length;

  const onTimeCompletionRate =
    completedTaskList.length > 0 ? Math.round((onTimeCompletedCount / completedTaskList.length) * 100) : 100;

  const assignedProjects = myProjects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    serviceType: p.serviceType,
    deadline: p.deadline ? p.deadline.toISOString() : null,
    completedTasksCount: p.tasks.filter((t) => t.status === "COMPLETED").length,
    totalTasksCount: p.tasks.length,
  }));

  return {
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    onTimeCompletionRate,
    assignedProjectsCount: assignedProjects.length,
    assignedProjects,
  };
}
