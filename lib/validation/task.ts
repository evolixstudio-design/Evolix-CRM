import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid("Valid project ID is required"),
  clientId: z.string().uuid("Valid client ID is required"),
  phaseId: z.string().uuid("Invalid phase ID").optional().nullable(),
  assignedToId: z.string().uuid("Invalid assignee ID").optional().nullable(),
  assignedInternId: z.string().uuid("Invalid intern ID").optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.ASSIGNED),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  declineReason: z.string().optional().nullable(),
});

export const taskDeclineSchema = z.object({
  declineReason: z.string().min(3, "A valid reason for declining is required (min 3 characters)."),
});

export const taskCommentCreateSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
});

export const taskAttachmentCreateSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().positive("File size must be > 0").optional().nullable(),
  fileType: z.string().optional().nullable(),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().optional(),
  phaseId: z.string().optional(),
  clientId: z.string().optional(),
  assignedToId: z.string().optional(),
  assignedInternId: z.string().optional(),
  myTasksOnly: z.coerce.boolean().optional(),
});
