import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { toggleFollowUpComplete } from "@/lib/services/lead.service";
import { leadFollowUpUpdateSchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { followUpId: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = leadFollowUpUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    if (validation.data.isCompleted !== undefined) {
      const updated = await toggleFollowUpComplete(
        user,
        params.followUpId,
        validation.data.isCompleted
      );
      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    throw AppError.unprocessableEntity("No update fields provided.");
  } catch (error) {
    return handleApiError(error);
  }
}
