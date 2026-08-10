import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { checkInUser } from "@/lib/services/attendance.service";
import { checkInSchema } from "@/lib/validation/attendance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body allowed
    }

    const validation = checkInSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid check-in parameters",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const record = await checkInUser(user, validation.data.notes);

    return NextResponse.json(
      {
        success: true,
        data: record,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
