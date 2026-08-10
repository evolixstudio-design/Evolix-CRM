import { z } from "zod";
import { ClientStatus, OnboardingStatus, LeadSource } from "@prisma/client";

export const clientCreateSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  companyName: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.ONBOARDING),
  source: z.nativeEnum(LeadSource).optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  assignedInternId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const onboardingUpdateSchema = z.object({
  status: z.nativeEnum(OnboardingStatus).optional(),
  businessInfo: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  services: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  targetEndDate: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  dealInfo: z.string().optional().nullable(),
  documents: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const clientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  assignedToId: z.string().optional(),
});

export const onboardingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(OnboardingStatus).optional(),
});
