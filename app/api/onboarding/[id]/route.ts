import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { updateOnboarding } from "@/lib/services/onboarding.service";
import { onboardingUpdateSchema } from "@/lib/validation/client";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const validation = onboardingUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid onboarding update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updateOnboarding(user, params.id, validation.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
