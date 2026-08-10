import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getFinanceChartData } from "@/lib/services/finance.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const chartData = await getFinanceChartData(user);

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
