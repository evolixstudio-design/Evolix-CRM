import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireTaskAccess, requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { TaskFilterOptions, PaginatedTasksResponse, TaskItem, WorkboardDataSummary } from "@/types/task";
import { TaskStatus, NotificationType, EntityType, ActivityAction, Prisma } from "@prisma/client";

/**
 * Format raw Prisma Task object into clean frontend TaskItem interface
 */
function formatTask(task: any): TaskItem {
  return {
    id: task.id,
    projectId: task.projectId,
    project: {
      id: task.project.id,
      name: task.project.name,
      serviceType: task.project.serviceType,
    },
    clientId: task.clientId,
    client: {
      id: task.client.id,
      name: task.client.name,
      companyName: task.client.companyName,
    },
    phaseId: task.phaseId || null,
    phase: task.phase ? { id: task.phase.id, name: task.phase.name } : null,
    assignedToId: task.assignedToId,
    assignedTo: task.assignedTo
      ? {
          id: task.assignedTo.id,
          name: task.assignedTo.name,
          email: task.assignedTo.email,
          avatarUrl: task.assignedTo.avatarUrl,
        }
      : null,
    assignedInternId: task.assignedInternId || null,
    assignedIntern: task.assignedIntern
      ? {
          id: task.assignedIntern.id,
          name: task.assignedIntern.name,
          email: task.assignedIntern.email,
          avatarUrl: task.assignedIntern.avatarUrl,
        }
      : null,
    createdById: task.createdById,
    createdBy: {
      id: task.createdBy.id,
      name: task.createdBy.name,
      email: task.createdBy.email,
      avatarUrl: task.createdBy.avatarUrl,
    },
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate ? task.startDate.toISOString() : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    declineReason: task.declineReason || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    comments: (task.comments || []).map((c: any) => ({
      id: c.id,
      taskId: c.taskId,
      userId: c.userId,
      user: {
        id: c.user.id,
        name: c.user.name,
        email: c.user.email,
        avatarUrl: c.user.avatarUrl,
      },
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    })),
    attachments: (task.attachments || []).map((a: any) => ({
      id: a.id,
      taskId: a.taskId,
      uploadedById: a.uploadedById,
      uploadedBy: {
        id: a.uploadedBy.id,
        name: a.uploadedBy.name,
        email: a.uploadedBy.email,
        avatarUrl: a.uploadedBy.avatarUrl,
      },
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize,
      fileType: a.fileType,
      createdAt: a.createdAt.toISOString(),
    })),
    subtasks: (task.subtasks || []).map((s: any) => ({
      id: s.id,
      taskId: s.taskId,
      title: s.title,
      isCompleted: s.isCompleted,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  };
}

/**
 * Fetch paginated tasks with search, filter, and role-scoped permissions
 */
export async function getTasks(
  user: AuthUser,
  options: TaskFilterOptions
): Promise<PaginatedTasksResponse> {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {};

  if (user.role === "INTERN" || options.myTasksOnly) {
    where.OR = [
      { assignedToId: user.id },
      { assignedInternId: user.id },
    ];
  } else if (options.assignedToId) {
    where.assignedToId = options.assignedToId;
  }

  if (options.search) {
    const q = options.search.trim();
    const searchFilter: Prisma.TaskWhereInput = {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { project: { name: { contains: q, mode: "insensitive" } } },
        { client: { name: { contains: q, mode: "insensitive" } } },
      ],
    };

    if (where.assignedToId) {
      where.AND = [searchFilter];
    } else {
      where.OR = searchFilter.OR;
    }
  }

  if (options.status) where.status = options.status;
  if (options.priority) where.priority = options.priority;
  if (options.projectId) where.projectId = options.projectId;
  if (options.phaseId) where.phaseId = options.phaseId;
  if (options.clientId) where.clientId = options.clientId;

  const [total, rawTasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        projectId: true,
        clientId: true,
        phaseId: true,
        assignedToId: true,
        assignedInternId: true,
        createdById: true,
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
        project: {
          select: { id: true, name: true, serviceType: true },
        },
        client: {
          select: { id: true, name: true, companyName: true },
        },
        phase: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedIntern: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            taskId: true,
            userId: true,
            content: true,
            createdAt: true,
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        attachments: {
          select: {
            id: true,
            taskId: true,
            uploadedById: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            uploadedBy: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        subtasks: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            taskId: true,
            title: true,
            isCompleted: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
  ]);

  const tasks = rawTasks.map(formatTask);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    tasks,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch task by ID with full details
 */
export async function getTaskById(user: AuthUser, taskId: string): Promise<TaskItem> {
  await requireTaskAccess(user.id, taskId, user.role);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      clientId: true,
      phaseId: true,
      assignedToId: true,
      assignedInternId: true,
      createdById: true,
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
      project: {
        select: { id: true, name: true, serviceType: true },
      },
      client: {
        select: { id: true, name: true, companyName: true },
      },
      phase: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignedIntern: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          taskId: true,
          userId: true,
          content: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      attachments: {
        select: {
          id: true,
          taskId: true,
          uploadedById: true,
          fileName: true,
          fileUrl: true,
          fileSize: true,
          fileType: true,
          createdAt: true,
          uploadedBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      subtasks: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          taskId: true,
          title: true,
          isCompleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!task) {
    throw AppError.notFound("Task not found.");
  }

  return formatTask(task);
}

/**
 * Create a new task (assigned to Team Leader)
 */
export async function createTask(user: AuthUser, data: any) {
  if (!data.projectId || !data.clientId) {
    throw AppError.unprocessableEntity("Both Project and Client are required for a task.");
  }

  const [projectExists, clientExists] = await Promise.all([
    prisma.project.findUnique({ where: { id: data.projectId } }),
    prisma.client.findUnique({ where: { id: data.clientId } }),
  ]);

  if (!projectExists) throw AppError.notFound("Associated Project not found.");
  if (!clientExists) throw AppError.notFound("Associated Client not found.");

  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      projectId: data.projectId,
      clientId: data.clientId,
      phaseId: data.phaseId || null,
      assignedToId: data.assignedToId || null,
      assignedInternId: data.assignedInternId || null,
      createdById: user.id,
      status: data.status || TaskStatus.ASSIGNED,
      priority: data.priority || "MEDIUM",
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    select: { id: true, title: true, assignedToId: true },
  });

  // Audit logs for task creation & assignment
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.TASK_CREATED,
      entityType: EntityType.TASK,
      entityId: newTask.id,
      metadata: { title: newTask.title },
    },
  });

  // Automatically send Notification & Activity log if assigned to Team Leader
  if (newTask.assignedToId) {
    await prisma.notification.create({
      data: {
        userId: newTask.assignedToId,
        title: "📋 New Task Assigned",
        message: `You have been assigned as Team Leader for task: "${newTask.title}"`,
        type: NotificationType.TASK_ASSIGNED,
        entityType: EntityType.TASK,
        entityId: newTask.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: ActivityAction.TASK_ASSIGNED,
        entityType: EntityType.TASK,
        entityId: newTask.id,
        metadata: { title: newTask.title, assignedToId: newTask.assignedToId },
      },
    });
  }

  return getTaskById(user, newTask.id);
}

/**
 * Accept task assignment by assigned Team Leader
 */
export async function acceptTask(user: AuthUser, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, title: true, assignedToId: true, assignedInternId: true, createdById: true },
  });

  if (!task) {
    throw AppError.notFound("Task not found.");
  }

  const isAssigned = task.assignedToId === user.id || task.assignedInternId === user.id;

  if (!isAssigned && user.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Only the person assigned to this task can accept it.");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.ACCEPTED,
      declineReason: null,
    },
  });

  // Send Notification to creator
  if (task.createdById && task.createdById !== user.id) {
    await prisma.notification.create({
      data: {
        userId: task.createdById,
        title: "✅ Task Assignment Accepted",
        message: `${user.name} accepted task: "${task.title}"`,
        type: NotificationType.TASK_ACCEPTED,
        entityType: EntityType.TASK,
        entityId: task.id,
      },
    });
  }

  return getTaskById(user, taskId);
}

/**
 * Decline task assignment by assigned user with required reason
 */
export async function declineTask(user: AuthUser, taskId: string, declineReason: string) {
  if (!declineReason || declineReason.trim().length < 3) {
    throw AppError.unprocessableEntity("A valid reason for declining is required.");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, title: true, assignedToId: true, assignedInternId: true, createdById: true },
  });

  if (!task) {
    throw AppError.notFound("Task not found.");
  }

  const isAssigned = task.assignedToId === user.id || task.assignedInternId === user.id;

  if (!isAssigned && user.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Only the person assigned to this task can decline it.");
  }


  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.DECLINED,
      declineReason: declineReason.trim(),
    },
  });

  // Send Notification to creator
  if (task.createdById && task.createdById !== user.id) {
    await prisma.notification.create({
      data: {
        userId: task.createdById,
        title: "❌ Task Assignment Declined",
        message: `${user.name} declined task "${task.title}". Reason: ${declineReason.trim()}`,
        type: NotificationType.TASK_DECLINED,
        entityType: EntityType.TASK,
        entityId: task.id,
      },
    });
  }

  return getTaskById(user, taskId);
}

/**
 * Update task status or details
 */
export async function updateTask(user: AuthUser, taskId: string, data: any) {
  await requireTaskAccess(user.id, taskId, user.role);

  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) {
    throw AppError.notFound("Task not found.");
  }

  const updatePayload: Prisma.TaskUpdateInput = {};

  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.status !== undefined) {
    updatePayload.status = data.status;
    if (data.status === TaskStatus.COMPLETED) {
      updatePayload.completedAt = new Date();
    }
  }
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.declineReason !== undefined) updatePayload.declineReason = data.declineReason;
  if (data.assignedToId !== undefined) {
    updatePayload.assignedTo = data.assignedToId ? { connect: { id: data.assignedToId } } : { disconnect: true };
  }
  if (data.assignedInternId !== undefined) {
    updatePayload.assignedIntern = data.assignedInternId ? { connect: { id: data.assignedInternId } } : { disconnect: true };
  }
  if (data.phaseId !== undefined) {
    updatePayload.phase = data.phaseId ? { connect: { id: data.phaseId } } : { disconnect: true };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
  });

  return getTaskById(user, taskId);
}

/**
 * Add comment to task
 */
export async function addTaskComment(user: AuthUser, taskId: string, content: string) {
  await requireTaskAccess(user.id, taskId, user.role);

  if (!content || !content.trim()) {
    throw AppError.unprocessableEntity("Comment content cannot be empty.");
  }

  await prisma.taskComment.create({
    data: {
      taskId,
      userId: user.id,
      content: content.trim(),
    },
  });

  return getTaskById(user, taskId);
}

/**
 * Prepared task information for Workboard consumption
 */
export async function getWorkboardData(user: AuthUser): Promise<{
  summary: WorkboardDataSummary;
  tasks: TaskItem[];
}> {
  await requireCoFounder(user);

  const rawTasks = await prisma.task.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      projectId: true,
      clientId: true,
      phaseId: true,
      assignedToId: true,
      assignedInternId: true,
      createdById: true,
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
      project: { select: { id: true, name: true, serviceType: true } },
      client: { select: { id: true, name: true, companyName: true } },
      phase: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignedIntern: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      comments: { select: { id: true, taskId: true, userId: true, content: true, createdAt: true, user: { select: { id: true, name: true, email: true } } } },
    },
  });

  const formattedTasks = rawTasks.map(formatTask);
  const now = new Date();

  const summary: WorkboardDataSummary = {
    assignedCount: formattedTasks.filter((t) => t.status === "ASSIGNED").length,
    acceptedCount: formattedTasks.filter((t) => t.status === "ACCEPTED").length,
    declinedCount: formattedTasks.filter((t) => t.status === "DECLINED").length,
    inProgressCount: formattedTasks.filter((t) => t.status === "IN_PROGRESS").length,
    submittedCount: formattedTasks.filter((t) => t.status === "SUBMITTED").length,
    completedCount: formattedTasks.filter((t) => t.status === "COMPLETED").length,
    overdueCount: formattedTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETED" && t.status !== "CANCELLED"
    ).length,
  };

  return {
    summary,
    tasks: formattedTasks,
  };
}

/**
 * Add attachment to task
 */
export async function addTaskAttachment(
  user: AuthUser,
  taskId: string,
  data: { fileName: string; fileUrl: string; fileSize?: number | null; fileType?: string | null }
) {
  await requireTaskAccess(user.id, taskId, user.role);

  await prisma.taskAttachment.create({
    data: {
      taskId,
      uploadedById: user.id,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || null,
      fileType: data.fileType || null,
    },
  });

  return getTaskById(user, taskId);
}

/**
 * Delete a task (Co-Founder only)
 */
export async function deleteTask(user: AuthUser, taskId: string) {
  await requireCoFounder(user);

  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) {
    throw AppError.notFound("Task not found.");
  }

  await prisma.task.delete({ where: { id: taskId } });

  return { success: true, id: taskId };
}

/**
 * Create a new subtask under a parent task
 */
export async function createSubtask(user: AuthUser, taskId: string, title: string) {
  await requireTaskAccess(user.id, taskId, user.role);

  const cleanTitle = title.trim();
  if (!cleanTitle) {
    throw AppError.unprocessableEntity("Subtask title cannot be empty.");
  }

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: cleanTitle,
      isCompleted: false,
    },
  });

  return getTaskById(user, taskId);
}

/**
 * Toggle subtask completion status or update title
 */
export async function toggleSubtask(
  user: AuthUser,
  subtaskId: string,
  data: { isCompleted?: boolean; title?: string }
) {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: { id: true, taskId: true },
  });

  if (!subtask) {
    throw AppError.notFound("Subtask not found.");
  }

  await requireTaskAccess(user.id, subtask.taskId, user.role);

  const updateData: any = {};
  if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
  if (data.title !== undefined && data.title.trim()) updateData.title = data.title.trim();

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: updateData,
  });

  return getTaskById(user, subtask.taskId);
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(user: AuthUser, subtaskId: string) {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: { id: true, taskId: true },
  });

  if (!subtask) {
    throw AppError.notFound("Subtask not found.");
  }

  await requireTaskAccess(user.id, subtask.taskId, user.role);

  await prisma.subtask.delete({
    where: { id: subtaskId },
  });

  return getTaskById(user, subtask.taskId);
}

