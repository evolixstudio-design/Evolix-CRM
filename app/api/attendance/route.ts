import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { getAttendanceList } from "@/lib/services/attendance.service";
import { attendanceQuerySchema } from "@/lib/validation/attendance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      status: searchParams.get("status") || undefined,
    };

    const validation = attendanceQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid attendance query parameters",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const result = await getAttendanceList(user, validation.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
