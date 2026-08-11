import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getLeadById, updateLead, deleteLead } from "@/lib/services/lead.service";
import { leadUpdateSchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireCoFounder();

    const lead = await getLeadById(params.id);

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = leadUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid update data",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedLead = await updateLead(params.id, validation.data, user.id);

    return NextResponse.json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const result = await deleteLead(params.id, user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

