import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getMeetingById, updateMeetingStatus } from "@/lib/services/meeting.service";
import { meetingUpdateSchema } from "@/lib/validation/meeting";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const meeting = await getMeetingById(user, params.id);

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = meetingUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    if (validation.data.status) {
      const updated = await updateMeetingStatus(user, params.id, validation.data.status);
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
