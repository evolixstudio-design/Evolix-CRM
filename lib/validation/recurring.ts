import { z } from "zod";

export const recurringContractCreateSchema = z.object({
  title: z.string().min(1, "Contract title is required"),
  clientId: z.string().uuid("Valid Client ID is required"),
  projectId: z.string().uuid().optional().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  durationMonths: z.number().int().positive("Duration must be at least 1 month").default(12),
  billingFrequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).default("MONTHLY"),
  monthlyAmount: z.number().positive("Monthly amount must be > 0"),
  currency: z.string().default("INR"),
  notes: z.string().optional().nullable(),
});

export const recurringContractUpdateSchema = recurringContractCreateSchema.partial().extend({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
});

export const recurringQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});
