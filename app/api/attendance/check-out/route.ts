import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { checkOutUser } from "@/lib/services/attendance.service";
import { checkOutSchema } from "@/lib/validation/attendance";
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

    const validation = checkOutSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid check-out parameters",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const record = await checkOutUser(user, validation.data.notes);

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
