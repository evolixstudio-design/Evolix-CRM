import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { TeamMemberItem } from "@/types/team";
import { UserRole, ActivityAction, EntityType } from "@prisma/client";

/**
 * DEFAULT CO-FOUNDER RESPONSIBILITIES MAPPING
 */
export function getDefaultDepartment(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("saifuddin")) return "Digital Marketing, Design";
  if (n.includes("taikhum")) return "Software, Website";
  if (n.includes("qusai")) return "Operations, Finance, Client Onboarding, Consulting";
  return null;
}

/**
 * Fetch all team members with operational workloads and activity (Co-Founder only)
 */
export async function getTeamMembers(user: AuthUser): Promise<TeamMemberItem[]> {
  await requireCoFounder(user);

  const now = new Date();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      ownedProjects: {
        where: { status: { in: ["PLANNING", "IN_PROGRESS"] } },
        select: { id: true },
      },
      projectMemberships: {
        where: { project: { status: { in: ["PLANNING", "IN_PROGRESS"] } } },
        select: { id: true },
      },
      assignedTasks: {
        select: {
          id: true,
          status: true,
          dueDate: true,
        },
      },
    },
  });

  return users.map((u) => {
    const activeProjectCount = new Set([
      ...u.ownedProjects.map((p) => p.id),
      ...u.projectMemberships.map((m) => m.id),
    ]).size;

    const activeTasksCount = u.assignedTasks.filter((t) =>
      ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"].includes(t.status)
    ).length;

    const pendingTasksCount = u.assignedTasks.filter((t) => t.status === "ASSIGNED").length;

    const overdueTasksCount = u.assignedTasks.filter(
      (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const dept = u.department || getDefaultDepartment(u.name);
    const lastAct = u.activityLogs.length > 0 ? u.activityLogs[0].createdAt.toISOString() : u.updatedAt.toISOString();

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || null,
      department: dept || null,
      role: u.role,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastActivityAt: lastAct,
      workload: {
        activeProjectsCount: activeProjectCount,
        activeTasksCount,
        pendingTasksCount,
        overdueTasksCount,
      },
    };
  });
}

/**
 * Fetch single team member with assigned projects & tasks (Co-Founder only)
 */
export async function getTeamMemberById(user: AuthUser, targetUserId: string): Promise<TeamMemberItem> {
  await requireCoFounder(user);

  const now = new Date();

  const u = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      ownedProjects: {
        select: {
          id: true,
          name: true,
          serviceType: true,
          status: true,
        },
      },
      projectMemberships: {
        select: {
          project: {
            select: {
              id: true,
              name: true,
              serviceType: true,
              status: true,
            },
          },
        },
      },
      assignedTasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      },
    },
  });

  if (!u) {
    throw AppError.notFound("Team member not found.");
  }

  const allProjectsMap = new Map<string, { id: string; name: string; serviceType: string; status: string }>();
  u.ownedProjects.forEach((p) => allProjectsMap.set(p.id, p));
  u.projectMemberships.forEach((m) => allProjectsMap.set(m.project.id, m.project));

  const projects = Array.from(allProjectsMap.values());
  const activeProjectCount = projects.filter((p) => ["PLANNING", "IN_PROGRESS"].includes(p.status)).length;

  const activeTasksCount = u.assignedTasks.filter((t) =>
    ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"].includes(t.status)
  ).length;

  const pendingTasksCount = u.assignedTasks.filter((t) => t.status === "ASSIGNED").length;

  const overdueTasksCount = u.assignedTasks.filter(
    (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now
  ).length;

  const dept = u.department || getDefaultDepartment(u.name);
  const lastAct = u.activityLogs.length > 0 ? u.activityLogs[0].createdAt.toISOString() : u.updatedAt.toISOString();

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || null,
    department: dept || null,
    role: u.role,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    lastActivityAt: lastAct,
    workload: {
      activeProjectsCount: activeProjectCount,
      activeTasksCount,
      pendingTasksCount,
      overdueTasksCount,
    },
    projects,
    tasks: u.assignedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    })),
  };
}

/**
 * Create a new Intern account (Co-Founder only)
 */
export async function createInternAccount(user: AuthUser, data: any) {
  await requireCoFounder(user);

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (existing) {
    throw AppError.conflict("An account with this email address already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password || "Password123!", 10);

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      department: data.department || null,
      passwordHash,
      role: UserRole.INTERN,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
    select: { id: true },
  });

  // Audit log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.USER_CREATED,
      entityType: EntityType.USER,
      entityId: newUser.id,
      metadata: { role: UserRole.INTERN, name: data.name, email: data.email },
    },
  });

  return getTeamMemberById(user, newUser.id);
}

/**
 * Update User Info (Name, Phone, Department, Active Status, Role) - Co-Founder only
 */
export async function updateTeamMemberInfo(
  user: AuthUser,
  targetUserId: string,
  data: {
    name?: string;
    phone?: string | null;
    department?: string | null;
    isActive?: boolean;
    role?: UserRole;
  }
) {
  await requireCoFounder(user);

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw AppError.notFound("Team member not found.");
  }

  // Prevent users from changing their own security role
  if (data.role && targetUserId === user.id && data.role !== existing.role) {
    throw AppError.unprocessableEntity("Users cannot modify their own security role.");
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.role !== undefined) updateData.role = data.role;

  await prisma.user.update({
    where: { id: targetUserId },
    data: updateData,
  });

  // Audit log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.USER_UPDATED,
      entityType: EntityType.USER,
      entityId: targetUserId,
      metadata: updateData,
    },
  });

  return getTeamMemberById(user, targetUserId);
}

/**
 * Activate or Deactivate a team member (Co-Founder only)
 */
export async function updateTeamMemberStatus(user: AuthUser, targetUserId: string, isActive: boolean) {
  return updateTeamMemberInfo(user, targetUserId, { isActive });
}

/**
 * Update team member role with self-role protection (Co-Founder only)
 */
export async function updateTeamMemberRole(user: AuthUser, targetUserId: string, newRole: UserRole) {
  return updateTeamMemberInfo(user, targetUserId, { role: newRole });
}
