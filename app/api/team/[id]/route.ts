import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getTeamMemberById, updateTeamMemberInfo } from "@/lib/services/team.service";
import { teamMemberUpdateSchema } from "@/lib/validation/team";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const member = await getTeamMemberById(user, params.id);

    return NextResponse.json({
      success: true,
      data: member,
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
    const validation = teamMemberUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid team member update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedMember = await updateTeamMemberInfo(user, params.id, validation.data);

    return NextResponse.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
