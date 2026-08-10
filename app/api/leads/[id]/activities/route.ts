import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { addLeadActivity } from "@/lib/services/lead.service";
import { leadActivityCreateSchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = leadActivityCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid activity payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const activity = await addLeadActivity(
      params.id,
      user.id,
      validation.data.type,
      validation.data.content
    );

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
