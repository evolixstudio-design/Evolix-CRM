import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { toggleSubtask, deleteSubtask } from "@/lib/services/task.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { subtaskId: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const updatedTask = await toggleSubtask(user, params.subtaskId, {
      isCompleted: body.isCompleted,
      title: body.title,
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { subtaskId: string } }
) {
  try {
    const user = await requireAuth();
    const updatedTask = await deleteSubtask(user, params.subtaskId);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
