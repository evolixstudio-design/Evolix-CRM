import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getLeadFollowUps, getTodayFollowUpsSummary } from "@/lib/services/lead.service";
import { followUpQuerySchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = followUpQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const [followUps, summary] = await Promise.all([
      getLeadFollowUps(user, validation.data),
      getTodayFollowUpsSummary(user),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        followUps,
        summary,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
