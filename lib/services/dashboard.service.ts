import { prisma } from "@/lib/db/prisma";
import { AuthUser } from "@/types";
import {
  CoFounderDashboardData,
  InternDashboardData,
  DashboardData,
  TeamMemberWorkload,
} from "@/types/dashboard";
import { AppError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

/**
 * Main entry point for Dashboard Data Service.
 * STRICT SECURITY REQUIREMENT:
 * Branches by user role BEFORE executing any queries.
 * Intern requests NEVER execute financial queries.
 */
export async function getDashboardData(user: AuthUser): Promise<DashboardData> {
  if (!user || !user.isActive) {
    throw AppError.unauthorized("Active authentication required.");
  }

  if (user.role === "CO_FOUNDER") {
    return await getCoFounderDashboardData();
  } else if (user.role === "INTERN") {
    return await getInternDashboardData(user.id);
  } else {
    throw AppError.forbidden("Unrecognized user role.");
  }
}

/**
 * Co-Founder Dashboard Service
 * Aggregates complete agency metrics: Business, Financial, and Team Workload.
 */
async function getCoFounderDashboardData(): Promise<CoFounderDashboardData> {
  const now = new Date();

  // Run independent queries in parallel using Promise.all for high performance
  const [
    totalLeads,
    newLeads,
    wonLeads,
    activeClients,
    activeProjects,
    pendingTasks,
    overdueTasks,
    paidPaymentsAgg,
    pendingPaymentsAgg,
    expensesAgg,
    teamUsers,
  ] = await Promise.all([
    // 1. Total Leads
    prisma.lead.count(),
    // 2. New Leads
    prisma.lead.count({ where: { status: "NEW" } }),
    // 3. Won Leads
    prisma.lead.count({ where: { status: "WON" } }),
    // 4. Active Clients
    prisma.client.count({ where: { status: "ACTIVE" } }),
    // 5. Active Projects
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    // 6. Pending Tasks (TODO, IN_PROGRESS, IN_REVIEW)
    prisma.task.count({
      where: {
        status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    // 7. Overdue Tasks
    prisma.task.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    // 8. Paid Revenue (SUM Payment where status = PAID)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    // 9. Pending Payments (SUM Payment where status = PENDING)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    // 10. Expenses (SUM Expense amount)
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    // 11. Active Team Members for Workload Calculation
    prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        assignedTasks: {
          where: {
            status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
          },
          select: { id: true, dueDate: true },
        },
        ownedProjects: {
          where: { status: "IN_PROGRESS" },
          select: { id: true },
        },
        projectMemberships: {
          where: {
            project: { status: "IN_PROGRESS" },
          },
          select: { id: true },
        },
      },
    }),
  ]);

  // Lead Conversion Rate Calculation (wonLeads / totalLeads * 100)
  const leadConversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100 * 10) / 10 : 0;

  // Financial Calculations using Prisma Decimal
  const revenueDecimal = paidPaymentsAgg._sum.amount ?? new Prisma.Decimal(0);
  const pendingPaymentsDecimal = pendingPaymentsAgg._sum.amount ?? new Prisma.Decimal(0);
  const expensesDecimal = expensesAgg._sum.amount ?? new Prisma.Decimal(0);
  const profitDecimal = revenueDecimal.minus(expensesDecimal);

  const revenue = revenueDecimal.toNumber();
  const pendingPayments = pendingPaymentsDecimal.toNumber();
  const expenses = expensesDecimal.toNumber();
  const profit = profitDecimal.toNumber();

  // Team Workload Formatting
  const teamWorkload: TeamMemberWorkload[] = teamUsers.map((member) => {
    const activeTasksCount = member.assignedTasks.length;
    const overdueTasksCount = member.assignedTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now
    ).length;
    const activeProjectsCount = member.ownedProjects.length + member.projectMemberships.length;

    return {
      userId: member.id,
      name: member.name,
      role: member.role,
      avatarUrl: member.avatarUrl,
      activeTasks: activeTasksCount,
      overdueTasks: overdueTasksCount,
      activeProjects: activeProjectsCount,
    };
  });

  return {
    role: "CO_FOUNDER",
    business: {
      totalLeads,
      newLeads,
      leadConversionRate,
      activeClients,
      activeProjects,
      pendingTasks,
      overdueTasks,
    },
    finance: {
      revenue,
      expenses,
      profit,
      pendingPayments,
    },
    teamWorkload,
  };
}

/**
 * Intern Dashboard Service
 * Scoped strictly to authenticated userId.
 * ABSOLUTELY NO FINANCIAL QUERIES ARE EXECUTED.
 */
async function getInternDashboardData(userId: string): Promise<InternDashboardData> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    myTasksCount,
    pendingTasksCount,
    todaysTasksCount,
    overdueTasksCount,
    completedTasksCount,
    myClients,
    myProjectsCount,
    notifications,
  ] = await Promise.all([
    // 1. Total assigned tasks
    prisma.task.count({
      where: { assignedToId: userId },
    }),
    // 2. Pending assigned tasks
    prisma.task.count({
      where: {
        assignedToId: userId,
        status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    // 3. Today's assigned tasks
    prisma.task.count({
      where: {
        assignedToId: userId,
        dueDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
    // 4. Overdue assigned tasks
    prisma.task.count({
      where: {
        assignedToId: userId,
        dueDate: { lt: startOfToday },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    // 5. Completed assigned tasks
    prisma.task.count({
      where: {
        assignedToId: userId,
        status: "COMPLETED",
      },
    }),
    // 6. My Clients (Directly assigned OR associated via project/task)
    prisma.client.count({
      where: {
        OR: [
          { assignedToId: userId },
          {
            projects: {
              some: {
                OR: [
                  { ownerId: userId },
                  { members: { some: { userId } } },
                ],
              },
            },
          },
          {
            tasks: {
              some: { assignedToId: userId },
            },
          },
        ],
      },
    }),
    // 7. My Projects (Owner or Project Member)
    prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    }),
    // 8. Personal Notifications
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
        isRead: true,
      },
    }),
  ]);

  // Task Progress Percentage (completed / total assigned * 100)
  const taskProgressPercentage =
    myTasksCount > 0 ? Math.round((completedTasksCount / myTasksCount) * 100) : 0;

  return {
    role: "INTERN",
    operational: {
      myTasksCount,
      pendingTasksCount,
      todaysTasksCount,
      overdueTasksCount,
      completedTasksCount,
      myClientsCount: myClients,
      myProjectsCount,
      taskProgressPercentage,
    },
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt.toISOString(),
      isRead: n.isRead,
    })),
  };
}
