import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getAttachmentsByEntity } from "@/lib/services/attachment.service";
import { noteAttachmentQuerySchema } from "@/lib/validation/attachment";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = noteAttachmentQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid query parameters.");
    }

    const attachments = await getAttachmentsByEntity(
      validation.data.entityType,
      validation.data.entityId,
    );

    return NextResponse.json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
