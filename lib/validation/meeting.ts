import { z } from "zod";
import { MeetingType, MeetingStatus } from "@/types/meeting";

export const meetingCreateSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  leadId: z.string().uuid("Invalid lead ID").optional().nullable(),
  clientId: z.string().uuid("Invalid client ID").optional().nullable(),
  meetingDate: z.string().datetime(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  type: z.nativeEnum(MeetingType).default(MeetingType.GOOGLE_MEET),
  meetingLink: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createInternalReminder: z.boolean().default(true),
  createClientReminder: z.boolean().default(true),
});

export const meetingUpdateSchema = z.object({
  title: z.string().optional(),
  meetingDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.nativeEnum(MeetingType).optional(),
  meetingLink: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(MeetingStatus).optional(),
});

export const meetingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  view: z.enum(["today", "upcoming", "overdue", "completed", "all"]).default("today"),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  organizerId: z.string().optional(),
  search: z.string().optional(),
});
