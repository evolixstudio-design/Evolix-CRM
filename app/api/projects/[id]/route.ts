import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { getProjectById, updateProject } from "@/lib/services/project.service";
import { projectUpdateSchema } from "@/lib/validation/project";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const project = await getProjectById(user, params.id);

    return NextResponse.json({
      success: true,
      data: project,
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
    const user = await requireAuth();

    const body = await req.json();
    const validation = projectUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid project update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updateProject(user, params.id, validation.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
