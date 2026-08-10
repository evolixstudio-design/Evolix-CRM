import { z } from "zod";

export const checkInSchema = z.object({
  notes: z.string().optional().nullable(),
});

export const checkOutSchema = z.object({
  notes: z.string().optional().nullable(),
});

export const attendanceUpdateSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]).optional(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]).optional(),
});
