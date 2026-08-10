import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthUser, UserRole } from "@/types";
import { prisma } from "@/lib/db/prisma";

/**
 * Ensures user is authenticated. Throws AppError.unauthorized if not.
 */
export async function requireAuth(user?: AuthUser): Promise<AuthUser> {
  const currentUser = user || (await getCurrentUser());
  if (!currentUser || !currentUser.isActive) {
    throw AppError.unauthorized("Authentication required to access this resource.");
  }
  return currentUser;
}

/**
 * Ensures user is authenticated and has CO_FOUNDER role.
 */
export async function requireCoFounder(user?: AuthUser): Promise<AuthUser> {
  const currentUser = await requireAuth(user);
  if (currentUser.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Access restricted to Co-Founders.");
  }
  return currentUser;
}

/**
 * Ensures user is authenticated and has INTERN or CO_FOUNDER role.
 */
export async function requireIntern(user?: AuthUser): Promise<AuthUser> {
  const currentUser = await requireAuth(user);
  if (currentUser.role !== "INTERN" && currentUser.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Access restricted to active team members.");
  }
  return currentUser;
}

/**
 * Verifies if user has access to a specific Project.
 * Co-founders have full access.
 * Interns must be project members or project owners.
 */
export async function requireProjectAccess(
  userId: string,
  projectId: string,
  userRole: UserRole
): Promise<boolean> {
  if (userRole === "CO_FOUNDER") {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (!project) {
    throw AppError.notFound("Project not found.");
  }

  const isMember = project.ownerId === userId || project.members.length > 0;
  if (!isMember) {
    throw AppError.forbidden("You do not have access to this project.");
  }

  return true;
}

/**
 * Verifies if user has access to a specific Task.
 * Co-founders have full access.
 * Interns must be assigned to the task or created the task.
 */
export async function requireTaskAccess(
  userId: string,
  taskId: string,
  userRole: UserRole
): Promise<boolean> {
  if (userRole === "CO_FOUNDER") {
    return true;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      assignedToId: true,
      createdById: true,
    },
  });

  if (!task) {
    throw AppError.notFound("Task not found.");
  }

  const isAssignedOrCreator = task.assignedToId === userId || task.createdById === userId;
  if (!isAssignedOrCreator) {
    throw AppError.forbidden("You do not have access to this task.");
  }

  return true;
}

/**
 * Verifies if user has access to a specific Client.
 * Co-founders have full access.
 * Interns must be assigned to the client or assigned to a project/task under the client.
 */
export async function requireClientAccess(
  userId: string,
  clientId: string,
  userRole: UserRole
): Promise<boolean> {
  if (userRole === "CO_FOUNDER") {
    return true;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      assignedToId: true,
      projects: {
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        select: { id: true },
      },
    },
  });

  if (!client) {
    throw AppError.notFound("Client not found.");
  }

  const isAssigned = client.assignedToId === userId || client.projects.length > 0;
  if (!isAssigned) {
    throw AppError.forbidden("You do not have access to this client.");
  }

  return true;
}
