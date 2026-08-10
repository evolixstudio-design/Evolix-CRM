import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { updateProjectPhase, deleteProjectPhase } from "@/lib/services/project.service";
import { projectPhaseUpdateSchema } from "@/lib/validation/project";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { phaseId: string } }
) {
  try {
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = projectPhaseUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid phase update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedProject = await updateProjectPhase(user, params.phaseId, validation.data);

    return NextResponse.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { phaseId: string } }
) {
  try {
    const user = await requireCoFounder();

    const updatedProject = await deleteProjectPhase(user, params.phaseId);

    return NextResponse.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
