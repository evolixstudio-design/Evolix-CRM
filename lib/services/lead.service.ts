import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  LeadFilterOptions,
  PaginatedLeadsResponse,
  LeadItem,
  FollowUpFilterOptions,
  LeadFollowUpItem,
  FollowUpWorkAreaSummary,
  CallOutcome,
  FollowUpType,
} from "@/types/lead";
import {
  LeadStatus,
  LeadPriority,
  LeadSource,
  LeadActivityType,
  ActivityAction,
  EntityType,
  Prisma,
} from "@prisma/client";

function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Format raw Prisma Lead object into clean frontend LeadItem interface
 */
function formatLead(lead: any): LeadItem {
  return {
    id: lead.id,
    name: lead.name,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    service: lead.service,
    status: lead.status,
    priority: lead.priority,
    estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
    assignedToId: lead.assignedToId,
    assignedTo: lead.assignedTo
      ? {
          id: lead.assignedTo.id,
          name: lead.assignedTo.name,
          email: lead.assignedTo.email,
          avatarUrl: lead.assignedTo.avatarUrl,
        }
      : null,
    nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null,
    notes: lead.notes,
    convertedAt: lead.convertedAt ? lead.convertedAt.toISOString() : null,
    convertedClient: lead.convertedClient
      ? { id: lead.convertedClient.id, name: lead.convertedClient.name }
      : null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    _count: lead._count,
  };
}

function formatFollowUp(f: any): LeadFollowUpItem {
  return {
    id: f.id,
    leadId: f.leadId,
    lead: f.lead
      ? {
          id: f.lead.id,
          name: f.lead.name,
          companyName: f.lead.companyName,
          phone: f.lead.phone,
          email: f.lead.email,
        }
      : undefined,
    type: f.type,
    notes: f.notes,
    dueDate: f.dueDate.toISOString(),
    assignedToId: f.assignedToId,
    assignedTo: f.assignedTo
      ? {
          id: f.assignedTo.id,
          name: f.assignedTo.name,
          email: f.assignedTo.email,
          avatarUrl: f.assignedTo.avatarUrl,
        }
      : null,
    isCompleted: f.isCompleted,
    completedAt: f.completedAt ? f.completedAt.toISOString() : null,
    createdById: f.createdById,
    createdBy: {
      id: f.createdBy.id,
      name: f.createdBy.name,
      email: f.createdBy.email,
      avatarUrl: f.createdBy.avatarUrl,
    },
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

/**
 * Fetch paginated leads with searching and multi-field filtering
 */
export async function getLeads(user: AuthUser, options: LeadFilterOptions): Promise<PaginatedLeadsResponse> {
  await requireCoFounder(user);
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.LeadWhereInput = {};

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { service: { contains: q, mode: "insensitive" } },
    ];
  }

  if (options.status) where.status = options.status;
  if (options.priority) where.priority = options.priority;
  if (options.source) where.source = options.source;
  if (options.assignedToId) where.assignedToId = options.assignedToId;

  const [total, rawLeads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
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
        source: true,
        service: true,
        status: true,
        priority: true,
        estimatedValue: true,
        assignedToId: true,
        nextFollowUpAt: true,
        notes: true,
        convertedAt: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        convertedClient: {
          select: { id: true, name: true },
        },
        _count: {
          select: { activities: true, followUps: true },
        },
      },
    }),
  ]);

  const leads = rawLeads.map(formatLead);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    leads,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get lead details by ID including activity history & scheduled follow-ups
 */
export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
      source: true,
      service: true,
      status: true,
      priority: true,
      estimatedValue: true,
      assignedToId: true,
      nextFollowUpAt: true,
      notes: true,
      convertedAt: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      convertedClient: {
        select: { id: true, name: true },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          leadId: true,
          userId: true,
          type: true,
          content: true,
          metadata: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      followUps: {
        orderBy: { dueDate: "asc" },
        select: {
          id: true,
          leadId: true,
          type: true,
          notes: true,
          dueDate: true,
          assignedToId: true,
          isCompleted: true,
          completedAt: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          assignedTo: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  return {
    ...formatLead(lead),
    activities: lead.activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    followUps: (lead.followUps || []).map((f) => ({
      ...f,
      dueDate: f.dueDate.toISOString(),
      completedAt: f.completedAt ? f.completedAt.toISOString() : null,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
  };
}

/**
 * Create a new lead
 */
export async function createLead(data: any, creatorUserId: string) {
  const newLead = await prisma.lead.create({
    data: {
      name: data.name,
      companyName: data.companyName || null,
      email: data.email || null,
      phone: data.phone || null,
      source: data.source,
      service: data.service || null,
      status: data.status || LeadStatus.NEW,
      priority: data.priority || LeadPriority.MEDIUM,
      estimatedValue: data.estimatedValue !== undefined && data.estimatedValue !== null ? new Prisma.Decimal(data.estimatedValue) : null,
      assignedToId: data.assignedToId || null,
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
      notes: data.notes || null,
      activities: {
        create: {
          userId: creatorUserId,
          type: LeadActivityType.NOTE,
          content: "Lead created in Evolix OS.",
        },
      },
    },
    select: { id: true },
  });

  // If initial nextFollowUpAt is provided, create a LeadFollowUp record
  if (data.nextFollowUpAt) {
    await prisma.leadFollowUp.create({
      data: {
        leadId: newLead.id,
        type: FollowUpType.CALL,
        dueDate: new Date(data.nextFollowUpAt),
        assignedToId: data.assignedToId || creatorUserId,
        createdById: creatorUserId,
        notes: "Initial follow-up scheduled.",
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: creatorUserId,
      action: ActivityAction.LEAD_CREATED,
      entityType: EntityType.LEAD,
      entityId: newLead.id,
      metadata: { name: data.name, source: data.source },
    },
  });

  return getLeadById(newLead.id);
}

/**
 * Update existing lead details
 */
export async function updateLead(id: string, data: any, updaterUserId: string) {
  const existingLead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: { select: { name: true } } },
  });
  if (!existingLead) {
    throw AppError.notFound("Lead not found.");
  }

  const updatePayload: Prisma.LeadUpdateInput = {};
  let isStatusChanged = false;
  let isAssignedChanged = false;
  let newAssigneeName = "";

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.companyName !== undefined) updatePayload.companyName = data.companyName;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.source !== undefined) updatePayload.source = data.source;
  if (data.service !== undefined) updatePayload.service = data.service;
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  if (data.assignedToId !== undefined && data.assignedToId !== existingLead.assignedToId) {
    isAssignedChanged = true;
    updatePayload.assignedTo = data.assignedToId ? { connect: { id: data.assignedToId } } : { disconnect: true };

    if (data.assignedToId) {
      const newAssignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { name: true },
      });
      newAssigneeName = newAssignee?.name || "Team Member";
    }
  }

  if (data.nextFollowUpAt !== undefined) {
    updatePayload.nextFollowUpAt = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
  }
  if (data.estimatedValue !== undefined) {
    updatePayload.estimatedValue = data.estimatedValue !== null ? new Prisma.Decimal(data.estimatedValue) : null;
  }

  if (data.status && data.status !== existingLead.status) {
    updatePayload.status = data.status;
    isStatusChanged = true;
  }

  await prisma.lead.update({
    where: { id },
    data: updatePayload,
  });

  // Log status change activity
  if (isStatusChanged) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: updaterUserId,
        type: LeadActivityType.STATUS_CHANGE,
        content: `Lead status changed from ${existingLead.status} to ${data.status}.`,
        metadata: { oldStatus: existingLead.status, newStatus: data.status },
      },
    });
  }

  // Log assignment activity
  if (isAssignedChanged) {
    const assignText = data.assignedToId ? `Assigned to ${newAssigneeName}.` : "Unassigned lead.";
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: updaterUserId,
        type: LeadActivityType.ASSIGNMENT,
        content: assignText,
        metadata: { assignedToId: data.assignedToId, assigneeName: newAssigneeName },
      },
    });
  }

  return getLeadById(id);
}

/**
 * Add a manual note or timeline activity to a lead
 */
export async function addLeadActivity(
  leadId: string,
  userId: string,
  type: LeadActivityType,
  content: string,
  metadata?: any
) {
  const leadExists = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!leadExists) {
    throw AppError.notFound("Lead not found.");
  }

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type,
      content,
      metadata: metadata || undefined,
    },
    select: {
      id: true,
      leadId: true,
      userId: true,
      type: true,
      content: true,
      metadata: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  return {
    ...activity,
    createdAt: activity.createdAt.toISOString(),
  };
}

/**
 * Log a call on a lead (with outcome, notes, call date, next follow-up & meeting)
 */
export async function logLeadCall(
  user: AuthUser,
  leadId: string,
  data: {
    outcome: CallOutcome;
    notes?: string | null;
    callDate?: string | null;
    nextFollowUpAt?: string | null;
    nextMeetingAt?: string | null;
  }
) {
  await requireCoFounder(user);

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  const callDateTime = data.callDate ? new Date(data.callDate) : new Date();

  // 1. Create CALL timeline activity
  const outcomeFormatted = data.outcome.replace(/_/g, " ");
  const contentSummary = `Call logged [Outcome: ${outcomeFormatted}].${data.notes ? ` Notes: ${data.notes}` : ""}`;

  const activityMetadata = {
    outcome: data.outcome,
    notes: data.notes || null,
    callDate: callDateTime.toISOString(),
    nextFollowUpAt: data.nextFollowUpAt || null,
    nextMeetingAt: data.nextMeetingAt || null,
  };

  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: user.id,
      type: LeadActivityType.CALL,
      content: contentSummary,
      createdAt: callDateTime,
      metadata: activityMetadata,
    },
  });

  // 2. If nextFollowUpAt is provided, update lead & schedule LeadFollowUp
  if (data.nextFollowUpAt) {
    const nextFollowUpDate = new Date(data.nextFollowUpAt);

    await prisma.lead.update({
      where: { id: leadId },
      data: { nextFollowUpAt: nextFollowUpDate },
    });

    await prisma.leadFollowUp.create({
      data: {
        leadId,
        type: FollowUpType.CALL,
        dueDate: nextFollowUpDate,
        notes: `Call Follow-up (${outcomeFormatted}): ${data.notes || "Follow up after call"}`,
        assignedToId: lead.assignedToId || user.id,
        createdById: user.id,
      },
    });

    // Also log FOLLOW_UP timeline entry
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: LeadActivityType.FOLLOW_UP,
        content: `Follow-up scheduled for ${nextFollowUpDate.toLocaleString("en-IN")}.`,
        metadata: { dueDate: nextFollowUpDate.toISOString(), type: FollowUpType.CALL },
      },
    });
  }

  // 3. If outcome is MEETING_FIXED or nextMeetingAt provided, log MEETING activity
  if (data.outcome === CallOutcome.MEETING_FIXED || data.nextMeetingAt) {
    const meetingDate = data.nextMeetingAt ? new Date(data.nextMeetingAt) : null;
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: LeadActivityType.MEETING,
        content: meetingDate
          ? `Meeting scheduled for ${meetingDate.toLocaleString("en-IN")}.`
          : "Meeting fixed during call.",
        metadata: { meetingDate: meetingDate ? meetingDate.toISOString() : null },
      },
    });
  }

  return getLeadById(leadId);
}

/**
 * Schedule a new follow-up for a lead
 */
export async function createLeadFollowUp(
  user: AuthUser,
  leadId: string,
  data: {
    type?: FollowUpType;
    dueDate: string;
    notes?: string | null;
    assignedToId?: string | null;
  }
) {
  await requireCoFounder(user);

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  const dueDate = new Date(data.dueDate);
  const type = data.type || FollowUpType.CALL;
  const assigneeId = data.assignedToId || lead.assignedToId || user.id;

  const followUp = await prisma.leadFollowUp.create({
    data: {
      leadId,
      type,
      dueDate,
      notes: data.notes || null,
      assignedToId: assigneeId,
      createdById: user.id,
    },
    select: {
      id: true,
      leadId: true,
      type: true,
      notes: true,
      dueDate: true,
      assignedToId: true,
      isCompleted: true,
      completedAt: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  // Update lead's nextFollowUpAt if this is sooner or nextFollowUpAt is null
  if (!lead.nextFollowUpAt || dueDate < lead.nextFollowUpAt) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { nextFollowUpAt: dueDate },
    });
  }

  // Log timeline activity
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: user.id,
      type: LeadActivityType.FOLLOW_UP,
      content: `Scheduled ${type} follow-up for ${dueDate.toLocaleString("en-IN")}.${data.notes ? ` Notes: ${data.notes}` : ""}`,
      metadata: { followUpId: followUp.id, dueDate: dueDate.toISOString(), type },
    },
  });

  return formatFollowUp(followUp);
}

/**
 * Toggle follow-up completion status
 */
export async function toggleFollowUpComplete(
  user: AuthUser,
  followUpId: string,
  isCompleted: boolean
) {
  await requireCoFounder(user);

  const existing = await prisma.leadFollowUp.findUnique({
    where: { id: followUpId },
    include: { lead: { select: { id: true, name: true } } },
  });

  if (!existing) {
    throw AppError.notFound("Follow-up not found.");
  }

  const updated = await prisma.leadFollowUp.update({
    where: { id: followUpId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    select: {
      id: true,
      leadId: true,
      type: true,
      notes: true,
      dueDate: true,
      assignedToId: true,
      isCompleted: true,
      completedAt: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, phone: true, email: true } },
    },
  });

  // Recalculate lead.nextFollowUpAt to next earliest pending follow-up date
  const nextPending = await prisma.leadFollowUp.findFirst({
    where: { leadId: existing.leadId, isCompleted: false },
    orderBy: { dueDate: "asc" },
    select: { dueDate: true },
  });

  await prisma.lead.update({
    where: { id: existing.leadId },
    data: { nextFollowUpAt: nextPending ? nextPending.dueDate : null },
  });

  // Log timeline activity
  await prisma.leadActivity.create({
    data: {
      leadId: existing.leadId,
      userId: user.id,
      type: LeadActivityType.FOLLOW_UP,
      content: isCompleted
        ? `Marked ${existing.type} follow-up as Completed.`
        : `Reopened ${existing.type} follow-up.`,
      metadata: { followUpId: existing.id, isCompleted },
    },
  });

  return formatFollowUp(updated);
}

/**
 * Fetch follow-ups for work area with view filters (today, overdue, upcoming, completed, all)
 */
export async function getLeadFollowUps(
  user: AuthUser,
  options: FollowUpFilterOptions
) {
  await requireCoFounder(user);

  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const where: Prisma.LeadFollowUpWhereInput = {};

  if (options.assignedToId) {
    where.assignedToId = options.assignedToId;
  }

  if (options.leadId) {
    where.leadId = options.leadId;
  }

  const view = options.view || "today";

  switch (view) {
    case "today":
      where.dueDate = { gte: startOfToday, lte: endOfToday };
      where.isCompleted = false;
      break;
    case "overdue":
      where.dueDate = { lt: startOfToday };
      where.isCompleted = false;
      break;
    case "upcoming":
      where.dueDate = { gt: endOfToday };
      where.isCompleted = false;
      break;
    case "completed":
      where.isCompleted = true;
      break;
    case "all":
      break;
  }

  const followUps = await prisma.leadFollowUp.findMany({
    where,
    orderBy: view === "overdue" ? { dueDate: "asc" } : { dueDate: "asc" },
    select: {
      id: true,
      leadId: true,
      type: true,
      notes: true,
      dueDate: true,
      assignedToId: true,
      isCompleted: true,
      completedAt: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, phone: true, email: true } },
    },
  });

  return followUps.map(formatFollowUp);
}

/**
 * Summary counts for Today's Follow-ups work area
 */
export async function getTodayFollowUpsSummary(user: AuthUser): Promise<FollowUpWorkAreaSummary> {
  await requireCoFounder(user);

  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const [todayCount, overdueCount, upcomingCount, completedTodayCount] = await Promise.all([
    prisma.leadFollowUp.count({
      where: {
        dueDate: { gte: startOfToday, lte: endOfToday },
        isCompleted: false,
      },
    }),
    prisma.leadFollowUp.count({
      where: {
        dueDate: { lt: startOfToday },
        isCompleted: false,
      },
    }),
    prisma.leadFollowUp.count({
      where: {
        dueDate: { gt: endOfToday },
        isCompleted: false,
      },
    }),
    prisma.leadFollowUp.count({
      where: {
        isCompleted: true,
        completedAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
  ]);

  return {
    todayCount,
    overdueCount,
    upcomingCount,
    completedTodayCount,
  };
}

/**
 * Transactional conversion of Lead to Client & Onboarding
 */
export async function convertLeadToClient(leadId: string, userId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
      country: true,
      source: true,
      service: true,
      estimatedValue: true,
      notes: true,
      assignedToId: true,
      convertedClient: { select: { id: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { type: true, content: true, createdAt: true },
      },
    },
  });

  if (!lead) {
    throw AppError.notFound("Lead not found.");
  }

  if (lead.convertedClient) {
    throw AppError.conflict("Lead has already been converted to a Client.");
  }

  return await prisma.$transaction(async (tx) => {
    // Check inside transaction to prevent race condition duplicate conversions
    const existingClient = await tx.client.findUnique({
      where: { convertedFromLeadId: leadId },
    });
    if (existingClient) {
      throw AppError.conflict("Lead has already been converted to a Client.");
    }

    // 1. Update Lead status to WON and set convertedAt
    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.WON,
        convertedAt: new Date(),
      },
    });

    // Compile lead history text
    const historySummary = lead.activities && lead.activities.length > 0
      ? `\n--- Carried Lead History ---\n` +
        lead.activities
          .map((a) => `[${a.createdAt.toISOString().split("T")[0]}] ${a.type}: ${a.content}`)
          .join("\n")
      : "";

    const combinedNotes = (lead.notes || "") + historySummary;

    // 2. Create Client record
    const client = await tx.client.create({
      data: {
        name: lead.companyName || lead.name,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        country: lead.country || null,
        source: lead.source,
        assignedToId: lead.assignedToId,
        convertedFromLeadId: leadId,
        notes: combinedNotes || null,
        status: "ONBOARDING",
      },
    });

    // 3. Create Onboarding record for the new Client (DO NOT CREATE PROJECT - M4 SCOPE)
    const dealSummary = lead.estimatedValue ? `Carried Lead Value: ₹${lead.estimatedValue}` : null;
    const contactSummary = `Primary Contact: ${lead.name}${lead.email ? ` | Email: ${lead.email}` : ""}${lead.phone ? ` | Phone: ${lead.phone}` : ""}`;

    const onboarding = await tx.onboarding.create({
      data: {
        clientId: client.id,
        status: "NOT_STARTED",
        services: lead.service || null,
        dealInfo: dealSummary,
        contactInfo: contactSummary,
        startDate: new Date(),
        notes: `Onboarding initiated from Lead '${lead.name}'.`,
      },
    });

    // 4. Log LeadActivity & ActivityLog
    await tx.leadActivity.create({
      data: {
        leadId,
        userId,
        type: LeadActivityType.STATUS_CHANGE,
        content: `Lead converted to Client '${client.name}'.`,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "LEAD_CONVERTED",
        entityType: "LEAD",
        entityId: leadId,
        metadata: {
          clientId: client.id,
          onboardingId: onboarding.id,
        },
      },
    });

    // 5. Notify Co-Founders about lead conversion
    const cofounders = await tx.user.findMany({ where: { role: "CO_FOUNDER" }, select: { id: true } });
    for (const cf of cofounders) {
      await tx.notification.create({
        data: {
          userId: cf.id,
          type: "SYSTEM",
          title: "🎉 Lead Converted!",
          message: `Lead '${lead.name}' (${lead.companyName || 'Lead'}) was converted into Client '${client.name}'.`,
          entityType: "CLIENT",
          entityId: client.id,
        },
      });
    }

    return {
      lead: updatedLead,
      client,
      onboarding,
    };
  });
}

/**
 * Delete a lead record (Co-Founder only)
 */
export async function deleteLead(leadId: string, userId: string) {
  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing) {
    throw AppError.notFound("Lead not found.");
  }

  await prisma.lead.delete({ where: { id: leadId } });

  return { success: true, id: leadId };
}

