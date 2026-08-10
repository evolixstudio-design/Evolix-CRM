import { NextResponse } from "next/server";
import { requireAuth, requireCoFounder } from "@/lib/permissions";
import { getProjects, createProject } from "@/lib/services/project.service";
import { projectCreateSchema, projectQuerySchema } from "@/lib/validation/project";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = projectQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getProjects(user, validation.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = projectCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid project input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const project = await createProject(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
