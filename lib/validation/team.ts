import { z } from "zod";

export const teamMemberUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  role: z.enum(["CO_FOUNDER", "INTERN"]).optional(),
});

export const internCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().default(true),
});
