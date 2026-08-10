import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getMeetings, getMeetingWorkAreaSummary } from "@/lib/services/meeting.service";
import { meetingQuerySchema } from "@/lib/validation/meeting";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = meetingQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid query parameters.");
    }

    const [meetings, summary] = await Promise.all([
      getMeetings(user, validation.data as any),
      getMeetingWorkAreaSummary(user),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        meetings,
        summary,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
