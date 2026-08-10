import { EntityType } from "@prisma/client";

export interface NoteAttachmentUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface NoteAttachmentItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  uploadedById: string;
  uploadedBy: NoteAttachmentUserSummary;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}
