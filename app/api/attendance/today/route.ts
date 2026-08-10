import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { getTodayStatus } from "@/lib/services/attendance.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const todayStatus = await getTodayStatus(user);

    return NextResponse.json({
      success: true,
      data: todayStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
