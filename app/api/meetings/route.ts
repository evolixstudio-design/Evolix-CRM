import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { createMeeting, getMeetings } from "@/lib/services/meeting.service";
import { meetingCreateSchema, meetingQuerySchema } from "@/lib/validation/meeting";
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

    const meetings = await getMeetings(user, validation.data as any);

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = meetingCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid meeting payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const meeting = await createMeeting(user, validation.data as any);

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
