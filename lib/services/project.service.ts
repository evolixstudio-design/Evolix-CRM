import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireProjectAccess, requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { ProjectFilterOptions, PaginatedProjectsResponse, ProjectItem, ProjectPhaseItem } from "@/types/project";
import { ProjectStatus, ProjectPriority, ProjectMemberRole, PhaseStatus, PaymentStatus, ActivityAction, EntityType, Prisma } from "@prisma/client";

/**
 * Format raw Prisma Project object into clean frontend ProjectItem interface
 * Calculates phase progress, task completion percentage, and overall project progress.
 */
function formatProject(project: any, userRole: string): ProjectItem {
  const totalTasks = project.tasks ? project.tasks.length : 0;
  const completedTasks = project.tasks
    ? project.tasks.filter((t: any) => t.status === "COMPLETED").length
    : 0;
  const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute Project Payments
  const rawProjectPayments = project.payments || [];
  const projectPaidAmountNum = rawProjectPayments
    .filter((p: any) => p.status === "PAID" || p.status === "PARTIAL")
    .reduce((acc: number, p: any) => acc + (p.amount ? Number(p.amount) : 0), 0);

  const rawContractVal = project.contractValue ? Number(project.contractValue) : 0;

  const phasesList: ProjectPhaseItem[] = (project.phases || []).map((ph: any) => {
    const phAmountNum = ph.amount ? Number(ph.amount) : 0;
    const phPayments = ph.payments || [];
    const phPaidNum = phPayments
      .filter((p: any) => p.status === "PAID" || p.status === "PARTIAL")
      .reduce((acc: number, p: any) => acc + (p.amount ? Number(p.amount) : 0), 0);
    const phPendingNum = Math.max(0, phAmountNum - phPaidNum);

    let phPaymentStatus: PaymentStatus = ph.paymentStatus || PaymentStatus.UNPAID;
    if (phPaidNum >= phAmountNum && phAmountNum > 0) {
      phPaymentStatus = PaymentStatus.PAID;
    } else if (phPaidNum > 0) {
      phPaymentStatus = PaymentStatus.PARTIAL;
    } else if (ph.dueDate && new Date(ph.dueDate) < new Date()) {
      phPaymentStatus = PaymentStatus.UNPAID; // or OVERDUE
    }

    return {
      id: ph.id,
      projectId: ph.projectId,
      name: ph.name,
      description: ph.description,
      startDate: ph.startDate ? ph.startDate.toISOString() : null,
      endDate: ph.endDate ? ph.endDate.toISOString() : null,
      dueDate: ph.dueDate ? ph.dueDate.toISOString() : (ph.endDate ? ph.endDate.toISOString() : null),
      amount: phAmountNum,
      paymentStatus: phPaymentStatus,
      paymentReceivedDate: ph.paymentReceivedDate ? ph.paymentReceivedDate.toISOString() : null,
      invoiceId: ph.invoiceId || null,
      invoiceNumber: ph.invoice ? ph.invoice.invoiceNumber : null,
      amountReceived: phPaidNum,
      amountPending: phPendingNum,
      status: ph.status,
      progress: ph.progress || 0,
      order: ph.order || 0,
      createdAt: ph.createdAt.toISOString(),
      updatedAt: ph.updatedAt.toISOString(),
      tasksCount: ph.tasks ? ph.tasks.length : 0,
    };
  });

  // Calculate sum of milestone phase amounts if contractValue is not set
  const milestoneSumNum = phasesList.reduce((acc, ph) => acc + ph.amount, 0);
  const projectValueNum = rawContractVal > 0 ? rawContractVal : milestoneSumNum;

  // Calculate Overall Project Payment Status
  const projectPendingNum = Math.max(0, projectValueNum - projectPaidAmountNum);
  let overallPaymentStatus: PaymentStatus = project.paymentStatus || PaymentStatus.UNPAID;
  if (projectPaidAmountNum >= projectValueNum && projectValueNum > 0) {
    overallPaymentStatus = PaymentStatus.PAID;
  } else if (projectPaidAmountNum > 0) {
    overallPaymentStatus = PaymentStatus.PARTIAL;
  }

  // Overall Progress Calculation:
  // If phases exist, overall progress = average of phase progress percentages.
  // If no phases exist, fallback to task completion percentage.
  let overallProgress = 0;
  if (phasesList.length > 0) {
    const totalPhaseProgress = phasesList.reduce((acc, ph) => acc + (ph.progress || 0), 0);
    overallProgress = Math.round(totalPhaseProgress / phasesList.length);
  } else {
    overallProgress = taskCompletionPercentage;
  }

  return {
    id: project.id,
    clientId: project.clientId,
    client: {
      id: project.client.id,
      name: project.client.name,
      companyName: project.client.companyName,
      email: project.client.email,
    },
    name: project.name,
    description: project.description,
    serviceType: project.serviceType,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate ? project.startDate.toISOString() : null,
    deadline: project.deadline ? project.deadline.toISOString() : null,
    completedAt: project.completedAt ? project.completedAt.toISOString() : null,
    contractValue: userRole === "CO_FOUNDER" && project.contractValue ? Number(project.contractValue) : undefined,
    projectValue: userRole === "CO_FOUNDER" ? projectValueNum : undefined,
    amountReceived: userRole === "CO_FOUNDER" ? projectPaidAmountNum : undefined,
    amountPending: userRole === "CO_FOUNDER" ? projectPendingNum : undefined,
    currency: project.currency || "INR",
    paymentStatus: overallPaymentStatus,
    contractType: project.contractType || "FIXED_PRICE",
    duration: project.duration || null,
    ownerId: project.ownerId,
    owner: project.owner
      ? {
          id: project.owner.id,
          name: project.owner.name,
          email: project.owner.email,
          avatarUrl: project.owner.avatarUrl,
        }
      : null,
    members: (project.members || []).map((m: any) => ({
      id: m.id,
      projectId: m.projectId,
      userId: m.userId,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.user.role,
      },
      createdAt: m.createdAt.toISOString(),
    })),
    phases: phasesList,
    tasks: (project.tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      assignedTo: t.assignedTo
        ? {
            id: t.assignedTo.id,
            name: t.assignedTo.name,
            email: t.assignedTo.email,
            avatarUrl: t.assignedTo.avatarUrl,
          }
        : null,
      phaseId: t.phaseId || null,
    })),
    notes: project.notes,
    progressPercentage: overallProgress,
    overallProgress,
    taskCompletionPercentage,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    _count: {
      tasks: totalTasks,
      members: project.members ? project.members.length : 0,
      phases: phasesList.length,
    },
  };
}

/**
 * Fetch paginated projects with search, filter, and role scoping
 */
export async function getProjects(
  user: AuthUser,
  options: ProjectFilterOptions
): Promise<PaginatedProjectsResponse> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {};

  if (user.role === "INTERN") {
    where.OR = [
      { ownerId: user.id },
      { members: { some: { userId: user.id } } },
    ];
  }

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      ...(where.OR || []),
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.priority) where.priority = options.priority;
  if (options.serviceType) where.serviceType = options.serviceType;
  if (options.clientId) where.clientId = options.clientId;
  if (options.ownerId) where.ownerId = options.ownerId;

  const [total, rawProjects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        clientId: true,
        name: true,
        description: true,
        serviceType: true,
        status: true,
        priority: true,
        startDate: true,
        deadline: true,
        completedAt: true,
        ...(user.role === "CO_FOUNDER" ? { contractValue: true } : {}),
        currency: true,
        paymentStatus: true,
        contractType: true,
        duration: true,
        ownerId: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          select: {
            id: true,
            projectId: true,
            userId: true,
            role: true,
            createdAt: true,
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
        payments: {
          select: { id: true, amount: true, status: true, paymentDate: true },
        },
        phases: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            projectId: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            dueDate: true,
            amount: true,
            paymentStatus: true,
            paymentReceivedDate: true,
            invoiceId: true,
            status: true,
            progress: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            invoice: { select: { id: true, invoiceNumber: true } },
            payments: { select: { id: true, amount: true, status: true } },
          },
        },
        tasks: {
          select: { id: true, status: true },
        },
        _count: {
          select: { tasks: true, members: true, phases: true },
        },
      },
    }),
  ]);

  const projects = rawProjects.map((p) => formatProject(p, user.role));
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    projects,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch project details by ID with access check and financial masking
 */
export async function getProjectById(user: AuthUser, projectId: string): Promise<ProjectItem> {
  await requireProjectAccess(user.id, projectId, user.role);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      clientId: true,
      name: true,
      description: true,
      serviceType: true,
      status: true,
      priority: true,
      startDate: true,
      deadline: true,
      completedAt: true,
      ...(user.role === "CO_FOUNDER" ? { contractValue: true } : {}),
      currency: true,
      paymentStatus: true,
      contractType: true,
      duration: true,
      ownerId: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: { id: true, name: true, companyName: true, email: true },
      },
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      members: {
        select: {
          id: true,
          projectId: true,
          userId: true,
          role: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, role: true },
          },
        },
      },
      payments: {
        select: { id: true, amount: true, status: true, paymentDate: true },
      },
      phases: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          projectId: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          dueDate: true,
          amount: true,
          paymentStatus: true,
          paymentReceivedDate: true,
          invoiceId: true,
          status: true,
          progress: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          invoice: { select: { id: true, invoiceNumber: true } },
          payments: { select: { id: true, amount: true, status: true } },
        },
      },
      tasks: {
        where: user.role === "INTERN" ? { assignedToId: user.id } : undefined,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          phaseId: true,
          assignedTo: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!project) {
    throw AppError.notFound("Project not found.");
  }

  return formatProject(project, user.role);
}

/**
 * Create a new Project (Co-Founder only)
 */
export async function createProject(user: AuthUser, data: any) {
  if (user.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Only Co-Founders can create projects.");
  }

  const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!clientExists) {
    throw AppError.notFound("Associated Client not found.");
  }

  const memberCreateInputs = (data.memberIds || []).map((userId: string) => ({
    userId,
    role: ProjectMemberRole.MEMBER,
  }));

  if (data.ownerId && !data.memberIds?.includes(data.ownerId)) {
    memberCreateInputs.push({
      userId: data.ownerId,
      role: ProjectMemberRole.OWNER,
    });
  }

  const newProject = await prisma.project.create({
    data: {
      clientId: data.clientId,
      name: data.name,
      description: data.description || null,
      serviceType: data.serviceType,
      status: data.status || ProjectStatus.PLANNING,
      priority: data.priority || ProjectPriority.MEDIUM,
      startDate: data.startDate ? new Date(data.startDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      contractValue: data.contractValue !== undefined && data.contractValue !== null ? new Prisma.Decimal(data.contractValue) : null,
      currency: data.currency || "INR",
      paymentStatus: data.paymentStatus || PaymentStatus.UNPAID,
      contractType: data.contractType || "FIXED_PRICE",
      duration: data.duration || null,
      ownerId: data.ownerId || null,
      notes: data.notes || null,
      members: {
        createMany: {
          data: memberCreateInputs,
          skipDuplicates: true,
        },
      },
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.PROJECT_CREATED,
      entityType: EntityType.PROJECT,
      entityId: newProject.id,
      metadata: { name: data.name, serviceType: data.serviceType },
    },
  });

  return getProjectById(user, newProject.id);
}

/**
 * Update existing project details
 */
export async function updateProject(user: AuthUser, projectId: string, data: any) {
  await requireProjectAccess(user.id, projectId, user.role);

  const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existingProject) {
    throw AppError.notFound("Project not found.");
  }

  const updatePayload: Prisma.ProjectUpdateInput = {};

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.serviceType !== undefined) updatePayload.serviceType = data.serviceType;
  if (data.status !== undefined) {
    updatePayload.status = data.status;
    if (data.status === ProjectStatus.COMPLETED) {
      updatePayload.completedAt = new Date();
    }
  }
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.deadline !== undefined) updatePayload.deadline = data.deadline ? new Date(data.deadline) : null;
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  // Restricted to Co-Founder only
  if (user.role === "CO_FOUNDER") {
    if (data.contractValue !== undefined) {
      updatePayload.contractValue = data.contractValue !== null ? new Prisma.Decimal(data.contractValue) : null;
    }
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.paymentStatus !== undefined) updatePayload.paymentStatus = data.paymentStatus;
    if (data.contractType !== undefined) updatePayload.contractType = data.contractType;
    if (data.duration !== undefined) updatePayload.duration = data.duration;
    if (data.ownerId !== undefined) {
      updatePayload.owner = data.ownerId ? { connect: { id: data.ownerId } } : { disconnect: true };
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: updatePayload,
  });

  return getProjectById(user, projectId);
}

/**
 * Add a new phase to a project
 */
export async function createProjectPhase(
  user: AuthUser,
  projectId: string,
  data: {
    name: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    dueDate?: string | null;
    amount?: number;
    invoiceId?: string | null;
    paymentStatus?: PaymentStatus;
    status?: PhaseStatus;
    progress?: number;
    order?: number;
  }
) {
  await requireProjectAccess(user.id, projectId, user.role);

  const phase = await prisma.projectPhase.create({
    data: {
      projectId,
      name: data.name,
      description: data.description || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : (data.endDate ? new Date(data.endDate) : null),
      amount: new Prisma.Decimal(data.amount || 0),
      invoiceId: data.invoiceId || null,
      paymentStatus: data.paymentStatus || PaymentStatus.UNPAID,
      status: data.status || PhaseStatus.NOT_STARTED,
      progress: data.progress !== undefined ? data.progress : 0,
      order: data.order !== undefined ? data.order : 0,
    },
  });

  return getProjectById(user, projectId);
}

/**
 * Update an existing project phase
 */
export async function updateProjectPhase(
  user: AuthUser,
  phaseId: string,
  data: {
    name?: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    dueDate?: string | null;
    amount?: number;
    invoiceId?: string | null;
    paymentStatus?: PaymentStatus;
    status?: PhaseStatus;
    progress?: number;
    order?: number;
  }
) {
  const phase = await prisma.projectPhase.findUnique({ where: { id: phaseId } });
  if (!phase) {
    throw AppError.notFound("Project phase not found.");
  }

  await requireProjectAccess(user.id, phase.projectId, user.role);

  const updateData: Prisma.ProjectPhaseUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount || 0);
  if (data.invoiceId !== undefined) {
    updateData.invoice = data.invoiceId ? { connect: { id: data.invoiceId } } : { disconnect: true };
  }
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === PhaseStatus.COMPLETED && data.progress === undefined) {
      updateData.progress = 100;
    }
  }
  if (data.progress !== undefined) {
    updateData.progress = Math.min(100, Math.max(0, data.progress));
    if (updateData.progress === 100) {
      updateData.status = PhaseStatus.COMPLETED;
    }
  }
  if (data.order !== undefined) updateData.order = data.order;

  await prisma.projectPhase.update({
    where: { id: phaseId },
    data: updateData,
  });

  return getProjectById(user, phase.projectId);
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  user: AuthUser,
  projectId: string,
  targetUserId: string,
  role: ProjectMemberRole = ProjectMemberRole.MEMBER
) {
  await requireCoFounder(user);

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUserId,
      },
    },
    create: {
      projectId,
      userId: targetUserId,
      role,
    },
    update: {
      role,
    },
  });

  return getProjectById(user, projectId);
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(user: AuthUser, projectId: string, targetUserId: string) {
  await requireCoFounder(user);

  await prisma.projectMember.deleteMany({
    where: {
      projectId,
      userId: targetUserId,
    },
  });

  return getProjectById(user, projectId);
}

/**
 * Delete a project phase
 */
export async function deleteProjectPhase(user: AuthUser, phaseId: string) {
  const phase = await prisma.projectPhase.findUnique({ where: { id: phaseId } });
  if (!phase) {
    throw AppError.notFound("Project phase not found.");
  }

  await requireProjectAccess(user.id, phase.projectId, user.role);

  await prisma.projectPhase.delete({ where: { id: phaseId } });

  return getProjectById(user, phase.projectId);
}
