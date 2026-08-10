import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export const paymentCreateSchema = z.object({
  clientId: z.string().uuid("Valid client ID is required"),
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentDate: z.string().datetime(),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.BANK_TRANSFER),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PAID),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const paymentUpdateSchema = paymentCreateSchema.partial();

export const expenseCreateSchema = z.object({
  description: z.string().min(1, "Expense description is required"),
  category: z.string().min(1, "Expense category is required"),
  amount: z.number().positive("Expense amount must be greater than 0"),
  expenseDate: z.string().datetime(),
  vendor: z.string().optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().nullable(),
  notes: z.string().optional().nullable(),
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  clientId: z.string().uuid("Invalid client ID").optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseCategoryCreateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});
