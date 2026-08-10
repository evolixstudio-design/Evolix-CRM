import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    const data = await getDashboardData(user);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
