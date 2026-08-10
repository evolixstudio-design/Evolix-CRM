import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getGlobalActivityLogs } from "@/lib/services/activity.service";
import { activityQuerySchema } from "@/lib/validation/activity";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();
    const { searchParams } = new URL(req.url);

    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      userId: searchParams.get("userId") || undefined,
      action: searchParams.get("action") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      entityId: searchParams.get("entityId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const validation = activityQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid activity query parameters",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const result = await getGlobalActivityLogs(user, validation.data as any);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
