import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { createLeadFollowUp, getLeadFollowUps } from "@/lib/services/lead.service";
import { leadFollowUpCreateSchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const followUps = await getLeadFollowUps(user, { leadId: params.id, view: "all" });

    return NextResponse.json({
      success: true,
      data: followUps,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = leadFollowUpCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid follow-up payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const followUp = await createLeadFollowUp(user, params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: followUp,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
