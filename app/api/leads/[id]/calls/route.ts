import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { logLeadCall } from "@/lib/services/lead.service";
import { leadCallLogSchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = leadCallLogSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid call log payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedLead = await logLeadCall(user, params.id, validation.data as any);

    return NextResponse.json(
      {
        success: true,
        data: updatedLead,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
