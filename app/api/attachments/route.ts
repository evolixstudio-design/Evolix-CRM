import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { addAttachment } from "@/lib/services/attachment.service";
import { noteAttachmentCreateSchema } from "@/lib/validation/attachment";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = noteAttachmentCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid attachment payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const attachment = await addAttachment(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: attachment,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
