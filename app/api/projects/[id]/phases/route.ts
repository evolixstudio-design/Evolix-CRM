import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { createProjectPhase } from "@/lib/services/project.service";
import { projectPhaseCreateSchema } from "@/lib/validation/project";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = projectPhaseCreateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid phase payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedProject = await createProjectPhase(user, params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: updatedProject,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
