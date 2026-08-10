import { z } from "zod";
import { LeadStatus, LeadPriority, LeadSource, LeadActivityType } from "@prisma/client";
import { CallOutcome, FollowUpType } from "@/types/lead";

export const leadCreateSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  companyName: z.string().optional().nullable().or(z.literal("")),
  email: z.union([z.string().email("Invalid email address"), z.literal(""), z.null(), z.undefined()]),
  phone: z.string().optional().nullable().or(z.literal("")),
  source: z.nativeEnum(LeadSource),
  service: z.string().optional().nullable().or(z.literal("")),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  estimatedValue: z.number().nonnegative("Value must be >= 0").optional().nullable(),
  assignedToId: z.union([z.string().uuid("Invalid assignee ID"), z.literal(""), z.null(), z.undefined()]),
  nextFollowUpAt: z.string().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable().or(z.literal("")),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const leadActivityCreateSchema = z.object({
  type: z.nativeEnum(LeadActivityType),
  content: z.string().min(1, "Content is required"),
  metadata: z.record(z.any()).optional().nullable(),
});

export const leadCallLogSchema = z.object({
  outcome: z.nativeEnum(CallOutcome),
  notes: z.string().optional().nullable().or(z.literal("")),
  callDate: z.string().optional().nullable().or(z.literal("")),
  nextFollowUpAt: z.string().optional().nullable().or(z.literal("")),
  nextMeetingAt: z.string().optional().nullable().or(z.literal("")),
});

export const leadFollowUpCreateSchema = z.object({
  type: z.nativeEnum(FollowUpType).default(FollowUpType.CALL),
  dueDate: z.string(),
  notes: z.string().optional().nullable().or(z.literal("")),
  assignedToId: z.union([z.string().uuid("Invalid assignee ID"), z.literal(""), z.null(), z.undefined()]),
});

export const leadFollowUpUpdateSchema = z.object({
  isCompleted: z.boolean().optional(),
  type: z.nativeEnum(FollowUpType).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional().nullable().or(z.literal("")),
  assignedToId: z.union([z.string().uuid("Invalid assignee ID"), z.literal(""), z.null(), z.undefined()]),
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  priority: z.nativeEnum(LeadPriority).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  assignedToId: z.string().optional(),
});

export const followUpQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  view: z.enum(["today", "overdue", "upcoming", "completed", "all"]).default("today"),
  assignedToId: z.string().optional(),
  leadId: z.string().optional(),
});
