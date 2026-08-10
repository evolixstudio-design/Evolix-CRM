import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { TaskStatus, TaskPriority, ProjectStatus, Prisma } from "@prisma/client";

export interface WorkboardFilterOptions {
  leaderId?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface LeaderDomainInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
  domain: string;
  avatarUrl?: string | null;
  activeProjectsCount: number;
  assignedTasksCount: number;
  pendingAcceptanceCount: number;
  inProgressCount: number;
  submittedCount: number;
  overdueCount: number;
}

export interface WorkboardSummary {
  myProjectsCount: number;
  myTasksCount: number;
  pendingAcceptanceCount: number;
  inProgressCount: number;
  submittedCount: number;
  completedCount: number;
  overdueCount: number;
  avgProgressPercentage: number;
}

export interface WorkboardResponse {
  summary: WorkboardSummary;
  projects: any[];
  tasks: any[];
  leadersWorkload: LeaderDomainInfo[];
  selectedLeader: {
    id: string;
    name: string;
    email: string;
    domain: string;
  };
}

const LEADER_DOMAINS: Record<string, string> = {
  Saifuddin: "Digital Marketing + Design",
  Taikhum: "Software + Website",
  Qusai: "Operations + Finance + Onboarding + Consulting",
};

/**
 * Fetch dedicated operational Workboard data for Team Leaders (Co-Founder only)
 */
export async function getWorkboardData(
  user: AuthUser,
  filters: WorkboardFilterOptions = {}
): Promise<WorkboardResponse> {
  // SECURITY REQUIREMENT: Strict 403 Rejection for Interns
  await requireCoFounder(user);

  // 1. Resolve target Team Leader ID (defaults to current logged in Co-Founder)
  const selectedLeaderId = filters.leaderId || user.id;

  const targetLeaderUser = await prisma.user.findUnique({
    where: { id: selectedLeaderId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!targetLeaderUser || targetLeaderUser.role !== "CO_FOUNDER") {
    throw AppError.notFound("Team Leader not found.");
  }

  const leaderDomain = LEADER_DOMAINS[targetLeaderUser.name] || "General Management";
  const now = new Date();

  // 2. Fetch all Co-Founder Team Leaders for workload comparison grid
  const coFounders = await prisma.user.findMany({
    where: { role: "CO_FOUNDER", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      ownedProjects: {
        where: { status: { in: ["PLANNING", "IN_PROGRESS"] } },
        select: { id: true },
      },
      assignedTasks: {
        select: { id: true, status: true, dueDate: true },
      },
    },
  });

  const leadersWorkload: LeaderDomainInfo[] = coFounders.map((cf) => {
    const domain = LEADER_DOMAINS[cf.name] || "General Operations";
    const activeTasks = cf.assignedTasks;

    return {
      userId: cf.id,
      name: cf.name,
      email: cf.email,
      role: cf.role,
      domain,
      avatarUrl: cf.avatarUrl,
      activeProjectsCount: cf.ownedProjects.length,
      assignedTasksCount: activeTasks.length,
      pendingAcceptanceCount: activeTasks.filter((t) => t.status === "ASSIGNED").length,
      inProgressCount: activeTasks.filter((t) => t.status === "IN_PROGRESS").length,
      submittedCount: activeTasks.filter((t) => t.status === "SUBMITTED").length,
      overdueCount: activeTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETED" && t.status !== "CANCELLED"
      ).length,
    };
  });

  // 3. Fetch Operational Projects led by selected Team Leader
  const rawProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: selectedLeaderId },
        { members: { some: { userId: selectedLeaderId } } },
      ],
      ...(filters.projectId ? { id: filters.projectId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      serviceType: true,
      status: true,
      priority: true,
      startDate: true,
      deadline: true,
      contractValue: true,
      currency: true,
      duration: true,
      client: { select: { id: true, name: true, companyName: true } },
      owner: { select: { id: true, name: true, email: true } },
      phases: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, status: true, progress: true },
      },
      tasks: { select: { id: true, status: true } },
    },
  });

  const formattedProjects = rawProjects.map((p) => {
    const totalTasks = p.tasks.length;
    const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length;
    const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let overallProgress = 0;
    if (p.phases.length > 0) {
      const sumPhaseProg = p.phases.reduce((acc, ph) => acc + (ph.progress || 0), 0);
      overallProgress = Math.round(sumPhaseProg / p.phases.length);
    } else {
      overallProgress = taskCompletionPct;
    }

    return {
      id: p.id,
      name: p.name,
      serviceType: p.serviceType,
      status: p.status,
      priority: p.priority,
      startDate: p.startDate ? p.startDate.toISOString() : null,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      contractValue: p.contractValue ? Number(p.contractValue) : null,
      currency: p.currency || "INR",
      duration: p.duration,
      client: p.client,
      owner: p.owner,
      phases: p.phases,
      overallProgress,
      tasksCount: totalTasks,
      completedTasksCount: completedTasks,
    };
  });

  // 4. Fetch Operational Tasks assigned to selected Team Leader with filters
  const taskWhere: Prisma.TaskWhereInput = {
    assignedToId: selectedLeaderId,
  };

  if (filters.projectId) taskWhere.projectId = filters.projectId;
  if (filters.status) taskWhere.status = filters.status;
  if (filters.priority) taskWhere.priority = filters.priority;
  if (filters.dueDate) {
    const targetDate = new Date(filters.dueDate);
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));
    taskWhere.dueDate = { gte: start, lte: end };
  }

  const rawTasks = await prisma.task.findMany({
    where: taskWhere,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      startDate: true,
      dueDate: true,
      completedAt: true,
      declineReason: true,
      createdAt: true,
      updatedAt: true,
      client: { select: { id: true, name: true, companyName: true } },
      project: { select: { id: true, name: true, serviceType: true } },
      phase: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      assignedIntern: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  const formattedTasks = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    startDate: t.startDate ? t.startDate.toISOString() : null,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    declineReason: t.declineReason,
    client: t.client,
    project: t.project,
    phase: t.phase,
    assignedTo: t.assignedTo,
    assignedIntern: t.assignedIntern,
    createdBy: t.createdBy,
    commentsCount: t.comments.length,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  // 5. Aggregate Operational Stat Cards for selected Leader
  const allLeaderTasks = await prisma.task.findMany({
    where: { assignedToId: selectedLeaderId },
    select: { status: true, dueDate: true },
  });

  const avgProgress =
    formattedProjects.length > 0
      ? Math.round(
          formattedProjects.reduce((acc, p) => acc + p.overallProgress, 0) /
            formattedProjects.length
        )
      : 0;

  const summary: WorkboardSummary = {
    myProjectsCount: formattedProjects.length,
    myTasksCount: allLeaderTasks.length,
    pendingAcceptanceCount: allLeaderTasks.filter((t) => t.status === "ASSIGNED").length,
    inProgressCount: allLeaderTasks.filter((t) => t.status === "IN_PROGRESS").length,
    submittedCount: allLeaderTasks.filter((t) => t.status === "SUBMITTED").length,
    completedCount: allLeaderTasks.filter((t) => t.status === "COMPLETED").length,
    overdueCount: allLeaderTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETED" && t.status !== "CANCELLED"
    ).length,
    avgProgressPercentage: avgProgress,
  };

  return {
    summary,
    projects: formattedProjects,
    tasks: formattedTasks,
    leadersWorkload,
    selectedLeader: {
      id: targetLeaderUser.id,
      name: targetLeaderUser.name,
      email: targetLeaderUser.email,
      domain: leaderDomain,
    },
  };
}
