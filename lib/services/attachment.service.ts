import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import { NoteAttachmentItem } from "@/types/attachment";
import { EntityType } from "@prisma/client";
import {
  validateAttachmentFile,
  sanitizeFileName,
} from "@/lib/attachment-utils";

const ATTACHMENT_SELECT = {
  id: true,
  entityType: true,
  entityId: true,
  uploadedById: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  createdAt: true,
  uploadedBy: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
};

function formatAttachment(a: any): NoteAttachmentItem {
  return {
    id: a.id,
    entityType: a.entityType,
    entityId: a.entityId,
    uploadedById: a.uploadedById,
    uploadedBy: {
      id: a.uploadedBy.id,
      name: a.uploadedBy.name,
      email: a.uploadedBy.email,
      avatarUrl: a.uploadedBy.avatarUrl,
    },
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: a.fileSize,
    createdAt: a.createdAt.toISOString(),
  };
}

/**
 * Verify that the parent entity exists in the database.
 */
async function verifyEntityExists(entityType: EntityType, entityId: string): Promise<void> {
  let exists = false;

  switch (entityType) {
    case EntityType.LEAD:
      exists = !!(await prisma.lead.findUnique({ where: { id: entityId }, select: { id: true } }));
      break;
    case EntityType.CLIENT:
      exists = !!(await prisma.client.findUnique({ where: { id: entityId }, select: { id: true } }));
      break;
    case EntityType.PROJECT:
      exists = !!(await prisma.project.findUnique({ where: { id: entityId }, select: { id: true } }));
      break;
    case EntityType.ONBOARDING:
      exists = !!(await prisma.onboarding.findUnique({ where: { id: entityId }, select: { id: true } }));
      break;
    case EntityType.TASK:
      exists = !!(await prisma.task.findUnique({ where: { id: entityId }, select: { id: true } }));
      break;
    default:
      throw AppError.unprocessableEntity(`Attachments are not supported for entity type "${entityType}".`);
  }

  if (!exists) {
    throw AppError.notFound(`${entityType} entity not found.`);
  }
}

/**
 * Fetch all attachments for a given entity.
 */
export async function getAttachmentsByEntity(
  entityType: EntityType,
  entityId: string,
): Promise<NoteAttachmentItem[]> {
  const attachments = await prisma.noteAttachment.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    select: ATTACHMENT_SELECT,
  });

  return attachments.map(formatAttachment);
}

/**
 * Add an attachment to an entity's notes.
 * Validates file metadata, sanitizes filename, and verifies entity existence.
 */
export async function addAttachment(
  user: AuthUser,
  data: {
    entityType: EntityType;
    entityId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    fileType?: string | null;
  },
): Promise<NoteAttachmentItem> {
  await requireCoFounder(user);

  // Verify entity exists
  await verifyEntityExists(data.entityType, data.entityId);

  // Sanitize filename
  const safeName = sanitizeFileName(data.fileName);

  // Validate file metadata
  const validation = validateAttachmentFile(safeName, data.fileType, data.fileSize);
  if (!validation.valid) {
    throw AppError.unprocessableEntity(validation.error!);
  }

  const attachment = await prisma.noteAttachment.create({
    data: {
      entityType: data.entityType,
      entityId: data.entityId,
      uploadedById: user.id,
      fileName: safeName,
      fileUrl: data.fileUrl,
      fileType: data.fileType || null,
      fileSize: data.fileSize || null,
    },
    select: ATTACHMENT_SELECT,
  });

  return formatAttachment(attachment);
}

/**
 * Delete an attachment by ID. Requires CO_FOUNDER role.
 */
export async function deleteAttachment(
  user: AuthUser,
  attachmentId: string,
): Promise<{ id: string; deleted: boolean }> {
  await requireCoFounder(user);

  const attachment = await prisma.noteAttachment.findUnique({
    where: { id: attachmentId },
    select: { id: true },
  });

  if (!attachment) {
    throw AppError.notFound("Attachment not found.");
  }

  await prisma.noteAttachment.delete({ where: { id: attachmentId } });

  return { id: attachmentId, deleted: true };
}
