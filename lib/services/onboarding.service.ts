import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireClientAccess } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { OnboardingFilterOptions, PaginatedOnboardingsResponse, OnboardingItem } from "@/types/client";
import { OnboardingStatus, Prisma } from "@prisma/client";

/**
 * Fetch paginated onboardings with status filter and role scoping
 */
export async function getOnboardings(
  user: AuthUser,
  options: OnboardingFilterOptions
): Promise<PaginatedOnboardingsResponse> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const clientConditions: Prisma.ClientWhereInput[] = [];

  if (user.role === "INTERN") {
    clientConditions.push({
      OR: [
        { assignedToId: user.id },
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
      ],
    });
  }

  if (options.search) {
    const q = options.search.trim();
    clientConditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.OnboardingWhereInput = {};

  if (clientConditions.length > 0) {
    where.client = { AND: clientConditions };
  }

  if (options.status) {
    where.status = options.status;
  }

  const [total, rawOnboardings] = await Promise.all([
    prisma.onboarding.count({ where }),
    prisma.onboarding.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        clientId: true,
        status: true,
        businessInfo: true,
        contactInfo: true,
        services: true,
        startDate: true,
        targetEndDate: true,
        completedAt: true,
        dealInfo: true,
        documents: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            name: true,
            companyName: true,
          },
        },
      },
    }),
  ]);

  const onboardings: OnboardingItem[] = rawOnboardings.map((ob) => ({
    id: ob.id,
    clientId: ob.clientId,
    status: ob.status,
    businessInfo: ob.businessInfo,
    contactInfo: ob.contactInfo,
    services: ob.services,
    startDate: ob.startDate ? ob.startDate.toISOString() : null,
    targetEndDate: ob.targetEndDate ? ob.targetEndDate.toISOString() : null,
    completedAt: ob.completedAt ? ob.completedAt.toISOString() : null,
    dealInfo: ob.dealInfo,
    documents: ob.documents,
    notes: ob.notes,
    createdAt: ob.createdAt.toISOString(),
    updatedAt: ob.updatedAt.toISOString(),
    clientName: ob.client.name,
    clientCompanyName: ob.client.companyName,
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    onboardings,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Update Onboarding workflow status and detailed info
 */
export async function updateOnboarding(user: AuthUser, onboardingId: string, data: any) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { id: onboardingId },
    select: { id: true, clientId: true },
  });

  if (!onboarding) {
    throw AppError.notFound("Onboarding record not found.");
  }

  await requireClientAccess(user.id, onboarding.clientId, user.role);

  const updatePayload: Prisma.OnboardingUpdateInput = {};

  if (data.status !== undefined) {
    updatePayload.status = data.status;
    if (data.status === OnboardingStatus.COMPLETED) {
      updatePayload.completedAt = new Date();
    }
  }
  if (data.businessInfo !== undefined) {
    updatePayload.businessInfo = data.businessInfo;
  }
  if (data.contactInfo !== undefined) {
    updatePayload.contactInfo = data.contactInfo;
  }
  if (data.services !== undefined) {
    updatePayload.services = data.services;
  }
  if (data.startDate !== undefined) {
    updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.targetEndDate !== undefined) {
    updatePayload.targetEndDate = data.targetEndDate ? new Date(data.targetEndDate) : null;
  }
  if (data.completedAt !== undefined) {
    updatePayload.completedAt = data.completedAt ? new Date(data.completedAt) : null;
  }
  if (data.dealInfo !== undefined) {
    updatePayload.dealInfo = data.dealInfo;
  }
  if (data.documents !== undefined) {
    updatePayload.documents = data.documents;
  }
  if (data.notes !== undefined) {
    updatePayload.notes = data.notes;
  }

  const updated = await prisma.onboarding.update({
    where: { id: onboardingId },
    data: updatePayload,
    select: {
      id: true,
      clientId: true,
      status: true,
      businessInfo: true,
      contactInfo: true,
      services: true,
      startDate: true,
      targetEndDate: true,
      completedAt: true,
      dealInfo: true,
      documents: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: { name: true, companyName: true },
      },
    },
  });

  return {
    id: updated.id,
    clientId: updated.clientId,
    status: updated.status,
    businessInfo: updated.businessInfo,
    contactInfo: updated.contactInfo,
    services: updated.services,
    startDate: updated.startDate ? updated.startDate.toISOString() : null,
    targetEndDate: updated.targetEndDate ? updated.targetEndDate.toISOString() : null,
    completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
    dealInfo: updated.dealInfo,
    documents: updated.documents,
    notes: updated.notes,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    clientName: updated.client.name,
    clientCompanyName: updated.client.companyName,
  };
}
