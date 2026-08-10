import { z } from "zod";
import { QuotationStatus } from "@prisma/client";

export const quotationItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  unitRate: z.number().min(0, "Unit rate must be >= 0").default(0),
});

export const quotationCreateSchema = z.object({
  leadId: z.string().uuid("Invalid Lead ID").optional().nullable(),
  clientId: z.string().uuid("Invalid Client ID").optional().nullable(),
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  status: z.nativeEnum(QuotationStatus).default(QuotationStatus.DRAFT),
  currency: z.string().default("INR"),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  validUntil: z.string().datetime().optional().nullable(),
  terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required in a quotation"),
});

export const quotationUpdateSchema = quotationCreateSchema.partial();

export const quotationStatusUpdateSchema = z.object({
  status: z.nativeEnum(QuotationStatus),
});

export const quotationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(QuotationStatus).optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
});
