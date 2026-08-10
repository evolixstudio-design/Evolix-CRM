import { z } from "zod";
import { EntityType } from "@prisma/client";

export const noteAttachmentCreateSchema = z.object({
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().uuid("Invalid entity ID"),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().positive("File size must be > 0").optional().nullable(),
  fileType: z.string().optional().nullable(),
});

export const noteAttachmentQuerySchema = z.object({
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().uuid("Invalid entity ID"),
});
