import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { createSubtask } from "@/lib/services/task.service";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      throw AppError.unprocessableEntity("Subtask title is required");
    }

    const updatedTask = await createSubtask(user, params.id, body.title);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
