import { z } from "zod";
import { ProjectServiceType, ProjectStatus, ProjectPriority, ProjectMemberRole, PhaseStatus, PaymentStatus } from "@prisma/client";

export const projectCreateSchema = z.object({
  clientId: z.string().uuid("Valid Client ID is required"),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().nullable(),
  serviceType: z.nativeEnum(ProjectServiceType),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIUM),
  startDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  contractValue: z.number().nonnegative("Value must be >= 0").optional().nullable(),
  currency: z.string().default("INR"),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.UNPAID),
  contractType: z.string().default("FIXED_PRICE"),
  duration: z.string().optional().nullable(),
  ownerId: z.string().uuid("Invalid owner ID").optional().nullable(),
  memberIds: z.array(z.string().uuid()).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const projectMemberAddSchema = z.object({
  userId: z.string().uuid("Valid user ID is required"),
  role: z.nativeEnum(ProjectMemberRole).default(ProjectMemberRole.MEMBER),
});

export const projectPhaseCreateSchema = z.object({
  name: z.string().min(1, "Phase name is required"),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  amount: z.number().nonnegative("Milestone amount must be >= 0").optional().default(0),
  invoiceId: z.string().optional().nullable(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.UNPAID),
  status: z.nativeEnum(PhaseStatus).default(PhaseStatus.NOT_STARTED),
  progress: z.number().min(0).max(100).default(0),
  order: z.number().default(0),
});

export const projectPhaseUpdateSchema = projectPhaseCreateSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(ProjectPriority).optional(),
  serviceType: z.nativeEnum(ProjectServiceType).optional(),
  clientId: z.string().optional(),
  ownerId: z.string().optional(),
});
