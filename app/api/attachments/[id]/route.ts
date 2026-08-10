import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { deleteAttachment } from "@/lib/services/attachment.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const result = await deleteAttachment(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
