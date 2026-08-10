import { NextResponse } from "next/server";
import { requireAuth, requireCoFounder } from "@/lib/permissions";
import { getTaskById, updateTask, deleteTask } from "@/lib/services/task.service";
import { taskUpdateSchema } from "@/lib/validation/task";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const task = await getTaskById(user, params.id);

    return NextResponse.json({
      success: true,
      data: task,
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
    const validation = taskUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid task update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updateTask(user, params.id, validation.data);

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

    const result = await deleteTask(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
