import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  MeetingItem,
  MeetingFilterOptions,
  MeetingWorkAreaSummary,
  MeetingType,
  MeetingStatus,
  RecipientType,
  ReminderStatus,
} from "@/types/meeting";
import { NotificationType, EntityType, ActivityAction, LeadActivityType, Prisma } from "@prisma/client";

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

function formatMeeting(m: any): MeetingItem {
  return {
    id: m.id,
    title: m.title,
    leadId: m.leadId,
    lead: m.lead
      ? {
          id: m.lead.id,
          name: m.lead.name,
          companyName: m.lead.companyName,
          email: m.lead.email,
          phone: m.lead.phone,
        }
      : null,
    clientId: m.clientId,
    client: m.client
      ? {
          id: m.client.id,
          name: m.client.name,
          companyName: m.client.companyName,
          email: m.client.email,
          phone: m.client.phone,
        }
      : null,
    meetingDate: m.meetingDate.toISOString(),
    startTime: m.startTime,
    endTime: m.endTime,
    type: m.type,
    meetingLink: m.meetingLink,
    location: m.location,
    participants: m.participants,
    notes: m.notes,
    status: m.status,
    organizerId: m.organizerId,
    organizer: {
      id: m.organizer.id,
      name: m.organizer.name,
      email: m.organizer.email,
      avatarUrl: m.organizer.avatarUrl,
    },
    reminders: m.reminders
      ? m.reminders.map((r: any) => ({
          ...r,
          remindAt: r.remindAt.toISOString(),
          sentAt: r.sentAt ? r.sentAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
        }))
      : undefined,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

/**
 * Schedule a new meeting linked to a Lead and/or Client
 */
export async function createMeeting(
  user: AuthUser,
  data: {
    title: string;
    leadId?: string | null;
    clientId?: string | null;
    meetingDate: string;
    startTime: string;
    endTime: string;
    type?: MeetingType;
    meetingLink?: string | null;
    location?: string | null;
    participants?: string | null;
    notes?: string | null;
    createInternalReminder?: boolean;
    createClientReminder?: boolean;
  }
): Promise<MeetingItem> {
  await requireCoFounder(user);

  const meetingDateObj = new Date(data.meetingDate);
  const type = data.type || MeetingType.GOOGLE_MEET;

  // Build full start DateTime for calculation
  const [startHour, startMin] = data.startTime.split(":").map(Number);
  const meetingStartDateTime = new Date(meetingDateObj);
  if (!isNaN(startHour) && !isNaN(startMin)) {
    meetingStartDateTime.setHours(startHour, startMin, 0, 0);
  }

  // 1. Create Meeting
  const meeting = await prisma.meeting.create({
    data: {
      title: data.title,
      leadId: data.leadId || null,
      clientId: data.clientId || null,
      meetingDate: meetingDateObj,
      startTime: data.startTime,
      endTime: data.endTime,
      type: type as any,
      meetingLink: data.meetingLink || null,
      location: data.location || null,
      participants: data.participants || null,
      notes: data.notes || null,
      status: MeetingStatus.SCHEDULED as any,
      organizerId: user.id,
    },
    include: {
      organizer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
    },
  });

  // 2. Create Internal Reminder & Notification
  if (data.createInternalReminder !== false) {
    const remindAt = new Date(meetingStartDateTime.getTime() - 30 * 60 * 1000); // 30 mins before

    await prisma.meetingReminder.create({
      data: {
        meetingId: meeting.id,
        recipientType: RecipientType.INTERNAL_USER as any,
        recipientId: user.id,
        recipientName: user.name,
        recipientEmail: user.email,
        remindAt: remindAt > new Date() ? remindAt : new Date(),
        channel: "NOTIFICATION",
        status: ReminderStatus.PENDING as any,
        notes: `Internal reminder for '${data.title}'`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.MEETING_SCHEDULED,
        title: "📅 Meeting Scheduled",
        message: `Meeting '${data.title}' scheduled for ${meetingDateObj.toLocaleDateString("en-IN")} at ${data.startTime}.`,
        entityType: EntityType.LEAD,
        entityId: meeting.id,
      },
    });
  }

  // 3. Create Client Reminder Record (Architecture record)
  const targetEmail = meeting.lead?.email || meeting.client?.email;
  const targetPhone = meeting.lead?.phone || meeting.client?.phone;
  const targetName = meeting.lead?.name || meeting.client?.name || "Client";

  if (data.createClientReminder !== false && (targetEmail || targetPhone)) {
    const remindAt = new Date(meetingStartDateTime.getTime() - 60 * 60 * 1000); // 1 hr before

    await prisma.meetingReminder.create({
      data: {
        meetingId: meeting.id,
        recipientType: RecipientType.CLIENT as any,
        recipientName: targetName,
        recipientEmail: targetEmail || null,
        remindAt: remindAt > new Date() ? remindAt : new Date(),
        channel: targetPhone ? "WHATSAPP_STUB" : "EMAIL_STUB",
        status: ReminderStatus.PENDING as any,
        notes: `Client reminder prepared for ${targetName}${targetPhone ? ` (Phone: ${targetPhone})` : ""}`,
      },
    });
  }

  // 4. TIMELINE INTEGRATION
  const meetingSummaryText = `Meeting scheduled: '${data.title}' (${type.replace(/_/g, " ")}) on ${meetingDateObj.toLocaleDateString("en-IN")} from ${data.startTime} to ${data.endTime}.${data.meetingLink ? ` Link: ${data.meetingLink}` : ""}`;

  const timelineMetadata = {
    meetingId: meeting.id,
    title: data.title,
    meetingDate: meetingDateObj.toISOString(),
    startTime: data.startTime,
    endTime: data.endTime,
    type,
    meetingLink: data.meetingLink || null,
    location: data.location || null,
  };

  // If linked to Lead, add to LeadActivity timeline
  if (data.leadId) {
    await prisma.leadActivity.create({
      data: {
        leadId: data.leadId,
        userId: user.id,
        type: LeadActivityType.MEETING,
        content: meetingSummaryText,
        metadata: timelineMetadata,
      },
    });
  }

  // Audit log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ActivityAction.LEAD_UPDATED,
      entityType: data.clientId ? EntityType.CLIENT : EntityType.LEAD,
      entityId: data.clientId || data.leadId || user.id,
      metadata: { action: "MEETING_SCHEDULED", meetingId: meeting.id, title: data.title },
    },
  });

  return getMeetingById(user, meeting.id);
}

/**
 * Fetch meeting by ID
 */
export async function getMeetingById(user: AuthUser, id: string): Promise<MeetingItem> {
  await requireCoFounder(user);

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      reminders: {
        include: {
          recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!meeting) {
    throw AppError.notFound("Meeting record not found.");
  }

  return formatMeeting(meeting);
}

/**
 * Update meeting status (SCHEDULED, COMPLETED, CANCELLED, MISSED)
 */
export async function updateMeetingStatus(
  user: AuthUser,
  meetingId: string,
  status: MeetingStatus
): Promise<MeetingItem> {
  await requireCoFounder(user);

  const existing = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!existing) {
    throw AppError.notFound("Meeting record not found.");
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: status as any },
    include: {
      organizer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      reminders: true,
    },
  });

  // Timeline log if completed
  if (status === MeetingStatus.COMPLETED && existing.leadId) {
    await prisma.leadActivity.create({
      data: {
        leadId: existing.leadId,
        userId: user.id,
        type: LeadActivityType.MEETING,
        content: `Meeting '${existing.title}' marked as Completed.`,
        metadata: { meetingId: existing.id, status: "COMPLETED" },
      },
    });
  }

  return formatMeeting(updated);
}

/**
 * Query meetings for Work Area / Calendar views
 */
export async function getMeetings(user: AuthUser, options: MeetingFilterOptions) {
  await requireCoFounder(user);

  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const where: Prisma.MeetingWhereInput = {};

  if (options.leadId) where.leadId = options.leadId;
  if (options.clientId) where.clientId = options.clientId;
  if (options.organizerId) where.organizerId = options.organizerId;

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { lead: { name: { contains: q, mode: "insensitive" } } },
      { client: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const view = options.view || "today";

  switch (view) {
    case "today":
      where.meetingDate = { gte: startOfToday, lte: endOfToday };
      break;
    case "upcoming":
      where.meetingDate = { gt: endOfToday };
      where.status = MeetingStatus.SCHEDULED as any;
      break;
    case "overdue":
      where.meetingDate = { lt: startOfToday };
      where.status = MeetingStatus.SCHEDULED as any;
      break;
    case "completed":
      where.status = MeetingStatus.COMPLETED as any;
      break;
    case "all":
      break;
  }

  const rawMeetings = await prisma.meeting.findMany({
    where,
    orderBy: { meetingDate: "asc" },
    include: {
      organizer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
      reminders: {
        include: {
          recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  return rawMeetings.map(formatMeeting);
}

/**
 * Summary metrics for Meetings Work Area
 */
export async function getMeetingWorkAreaSummary(user: AuthUser): Promise<MeetingWorkAreaSummary> {
  await requireCoFounder(user);

  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const [todayCount, upcomingCount, overdueCount, completedTodayCount] = await Promise.all([
    prisma.meeting.count({
      where: {
        meetingDate: { gte: startOfToday, lte: endOfToday },
      },
    }),
    prisma.meeting.count({
      where: {
        meetingDate: { gt: endOfToday },
        status: MeetingStatus.SCHEDULED as any,
      },
    }),
    prisma.meeting.count({
      where: {
        meetingDate: { lt: startOfToday },
        status: MeetingStatus.SCHEDULED as any,
      },
    }),
    prisma.meeting.count({
      where: {
        status: MeetingStatus.COMPLETED as any,
        updatedAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
  ]);

  return {
    todayCount,
    upcomingCount,
    overdueCount,
    completedTodayCount,
  };
}
