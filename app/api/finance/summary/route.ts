import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getFinanceSummary } from "@/lib/services/finance.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const summary = await getFinanceSummary(user);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
