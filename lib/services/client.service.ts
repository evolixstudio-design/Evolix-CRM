import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireClientAccess } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { ClientFilterOptions, PaginatedClientsResponse, ClientItem } from "@/types/client";
import { ClientStatus, ActivityAction, EntityType, Prisma } from "@prisma/client";

function calculateClientProgress(tasks: any[]): number {
  if (!tasks || tasks.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  tasks.forEach((t) => {
    const subtasks = t.subtasks || [];
    if (subtasks.length > 0) {
      const doneSubs = subtasks.filter((s: any) => s.isCompleted).length;
      totalWeight += subtasks.length;
      completedWeight += doneSubs;
    } else {
      totalWeight += 1;
      if (t.status === "COMPLETED") {
        completedWeight += 1;
      } else if (t.status === "IN_PROGRESS") {
        completedWeight += 0.5;
      }
    }
  });

  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

/**
 * Helper to build role-scoped Prisma where condition for Clients
 */
function getClientWhereClause(user: AuthUser, options: ClientFilterOptions): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {};

  if (user.role === "INTERN") {
    where.OR = [
      { assignedToId: user.id },
      { assignedInternId: user.id },
      {
        projects: {
          some: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      },
      {
        tasks: {
          some: { assignedToId: user.id },
        },
      },
    ];
  }

  if (options.search) {
    const q = options.search.trim();
    const searchFilter: Prisma.ClientWhereInput = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { industry: { contains: q, mode: "insensitive" } },
      ],
    };

    if (where.OR) {
      where.AND = [searchFilter];
    } else {
      where.OR = searchFilter.OR;
    }
  }

  if (options.status) where.status = options.status;
  if (options.assignedToId && user.role === "CO_FOUNDER") {
    where.assignedToId = options.assignedToId;
  }

  return where;
}

/**
 * Fetch paginated clients with search, filter, and role-scoped permissions
 */
export async function getClients(
  user: AuthUser,
  options: ClientFilterOptions
): Promise<PaginatedClientsResponse> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where = getClientWhereClause(user, options);

  const [total, rawClients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        whatsapp: true,
        address: true,
        website: true,
        industry: true,
        status: true,
        source: true,
        assignedToId: true,
        convertedFromLeadId: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedInternId: true,
        assignedIntern: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        tasks: {
          where: user.role === "INTERN" ? { assignedToId: user.id } : undefined,
          select: {
            id: true,
            status: true,
            subtasks: { select: { id: true, isCompleted: true } },
          },
        },
        onboarding: {
          select: {
            id: true,
            status: true,
            startDate: true,
            completedAt: true,
            notes: true,
          },
        },
        ...(user.role === "CO_FOUNDER"
          ? {
              payments: {
                where: { status: "PAID" },
                select: { amount: true },
              },
              expenses: {
                select: { amount: true },
              },
            }
          : {}),
      },
    }),
  ]);

  const clients: ClientItem[] = rawClients.map((client: any) => {
    let financials: { totalPayments: number; totalExpenses: number } | undefined = undefined;

    if (user.role === "CO_FOUNDER") {
      const totalPayments = (client.payments || []).reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const totalExpenses = (client.expenses || []).reduce(
        (sum: number, e: any) => sum + Number(e.amount),
        0
      );
      financials = { totalPayments, totalExpenses };
    }

    const progressPercentage = calculateClientProgress(client.tasks || []);


    return {
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      address: client.address,
      website: client.website,
      industry: client.industry,
      status: client.status,
      source: client.source,
      assignedToId: client.assignedToId,
      assignedTo: client.assignedTo,
      assignedInternId: client.assignedInternId,
      assignedIntern: client.assignedIntern,
      convertedFromLeadId: client.convertedFromLeadId,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      onboarding: client.onboarding
        ? {
            ...client.onboarding,
            clientId: client.id,
            startDate: client.onboarding.startDate ? client.onboarding.startDate.toISOString() : null,
            completedAt: client.onboarding.completedAt ? client.onboarding.completedAt.toISOString() : null,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
          }
        : null,
      progressPercentage,
      financials,
    };
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    clients,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch detailed client profile by ID with strict access control and financial masking
 */
export async function getClientById(user: AuthUser, clientId: string): Promise<ClientItem> {
  await requireClientAccess(user.id, clientId, user.role);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
      whatsapp: true,
      address: true,
      website: true,
      industry: true,
      status: true,
      source: true,
      assignedToId: true,
      convertedFromLeadId: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignedInternId: true,
      assignedIntern: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      onboarding: {
        select: {
          id: true,
          status: true,
          startDate: true,
          completedAt: true,
          notes: true,
        },
      },
      projects: {
        where:
          user.role === "INTERN"
            ? {
                OR: [
                  { ownerId: user.id },
                  { members: { some: { userId: user.id } } },
                ],
              }
            : undefined,
        select: {
          id: true,
          name: true,
          serviceType: true,
          status: true,
          deadline: true,
        },
      },
      tasks: {
        where: user.role === "INTERN" ? { assignedToId: user.id } : undefined,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          assignedTo: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          subtasks: {
            select: { id: true, title: true, isCompleted: true },
          },
        },
      },
      ...(user.role === "CO_FOUNDER"
        ? {
            payments: {
              where: { status: "PAID" },
              select: { amount: true },
            },
            expenses: {
              select: { amount: true },
            },
          }
        : {}),
    },
  });

  if (!client) {
    throw AppError.notFound("Client not found.");
  }

  let financials: { totalPayments: number; totalExpenses: number } | undefined = undefined;

  if (user.role === "CO_FOUNDER") {
    const totalPayments = (client.payments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    );
    const totalExpenses = (client.expenses || []).reduce(
      (sum: number, e: any) => sum + Number(e.amount),
      0
    );
    financials = { totalPayments, totalExpenses };
  }

  return {
    id: client.id,
    name: client.name,
    companyName: client.companyName,
    email: client.email,
    phone: client.phone,
    whatsapp: client.whatsapp,
    address: client.address,
    website: client.website,
    industry: client.industry,
    status: client.status,
    source: client.source,
    assignedToId: client.assignedToId,
    assignedTo: client.assignedTo,
    assignedInternId: client.assignedInternId,
    assignedIntern: client.assignedIntern,
    convertedFromLeadId: client.convertedFromLeadId,
    notes: client.notes,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    onboarding: client.onboarding
      ? {
          ...client.onboarding,
          clientId: client.id,
          startDate: client.onboarding.startDate ? client.onboarding.startDate.toISOString() : null,
          completedAt: client.onboarding.completedAt ? client.onboarding.completedAt.toISOString() : null,
          createdAt: client.createdAt.toISOString(),
          updatedAt: client.updatedAt.toISOString(),
        }
      : null,
    projects: client.projects.map((p) => ({
      ...p,
      deadline: p.deadline ? p.deadline.toISOString() : null,
    })),
    tasks: client.tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    })),
    progressPercentage: calculateClientProgress(client.tasks || []),
    financials,
  };
}

/**
 * Create a new Client and automatically initialize associated Onboarding record
 */
export async function createClient(user: AuthUser, data: any) {
  if (user.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Only Co-Founders can create new client accounts.");
  }

  const client = await prisma.client.create({
    data: {
      name: data.name,
      companyName: data.companyName || null,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      website: data.website || null,
      industry: data.industry || null,
      status: data.status || ClientStatus.ONBOARDING,
      source: data.source || null,
      assignedToId: data.assignedToId || null,
      assignedInternId: data.assignedInternId || null,
      notes: data.notes || null,
      onboarding: {
        create: {
          status: "NOT_STARTED",
          startDate: new Date(),
        },
      },
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.CLIENT_CREATED,
      entityType: EntityType.CLIENT,
      entityId: client.id,
      metadata: { name: data.name, companyName: data.companyName },
    },
  });

  return getClientById(user, client.id);
}

/**
 * Update client details
 */
export async function updateClient(user: AuthUser, clientId: string, data: any) {
  await requireClientAccess(user.id, clientId, user.role);

  const existingClient = await prisma.client.findUnique({ where: { id: clientId } });
  if (!existingClient) {
    throw AppError.notFound("Client not found.");
  }

  const updatePayload: Prisma.ClientUpdateInput = {};

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.companyName !== undefined) updatePayload.companyName = data.companyName;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp;
  if (data.address !== undefined) updatePayload.address = data.address;
  if (data.website !== undefined) updatePayload.website = data.website;
  if (data.industry !== undefined) updatePayload.industry = data.industry;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.source !== undefined) updatePayload.source = data.source;
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.assignedToId !== undefined && user.role === "CO_FOUNDER") {
    updatePayload.assignedTo = data.assignedToId
      ? { connect: { id: data.assignedToId } }
      : { disconnect: true };
  }
  if (data.assignedInternId !== undefined && user.role === "CO_FOUNDER") {
    updatePayload.assignedIntern = data.assignedInternId
      ? { connect: { id: data.assignedInternId } }
      : { disconnect: true };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: updatePayload,
  });

  return getClientById(user, clientId);
}

/**
 * Delete a client record (Co-Founder only)
 */
export async function deleteClient(user: AuthUser, clientId: string) {
  if (user.role !== "CO_FOUNDER") {
    throw AppError.forbidden("Only Co-Founders can delete client accounts.");
  }

  const existing = await prisma.client.findUnique({ where: { id: clientId } });
  if (!existing) {
    throw AppError.notFound("Client not found.");
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  return { success: true, id: clientId };
}
