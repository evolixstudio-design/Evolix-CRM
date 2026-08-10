import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { addTaskComment } from "@/lib/services/task.service";
import { taskCommentCreateSchema } from "@/lib/validation/task";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const validation = taskCommentCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid comment payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedTask = await addTaskComment(user, params.id, validation.data.content);

    return NextResponse.json(
      {
        success: true,
        data: updatedTask,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
