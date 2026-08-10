import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { getReportsData } from "@/lib/services/report.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    const result = await getReportsData(user);

    return NextResponse.json({
      success: true,
      data: result.data,
      role: result.role,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
