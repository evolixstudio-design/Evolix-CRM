import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  unitRate: z.number().min(0, "Unit rate must be >= 0").default(0),
});

export const invoiceCreateSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID").optional().nullable(),
  clientId: z.string().uuid("Client ID is required"),
  issueDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  currency: z.string().default("INR"),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required in an invoice"),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();

export const invoiceStatusUpdateSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
});
