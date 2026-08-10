import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { updateAttendanceRecord } from "@/lib/services/attendance.service";
import { attendanceUpdateSchema } from "@/lib/validation/attendance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = attendanceUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid attendance update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updateAttendanceRecord(user, params.id, validation.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
