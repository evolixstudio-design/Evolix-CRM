import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { addProjectMember, removeProjectMember } from "@/lib/services/project.service";
import { projectMemberAddSchema } from "@/lib/validation/project";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = projectMemberAddSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid member payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await addProjectMember(
      user,
      params.id,
      validation.data.userId,
      validation.data.role
    );

    return NextResponse.json({
      success: true,
      data: updated,
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

    const { searchParams } = new URL(req.url);
    const memberUserId = searchParams.get("userId");

    if (!memberUserId) {
      throw AppError.unprocessableEntity("userId parameter is required");
    }

    const updated = await removeProjectMember(user, params.id, memberUserId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
