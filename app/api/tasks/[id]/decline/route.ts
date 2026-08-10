import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { declineTask } from "@/lib/services/task.service";
import { taskDeclineSchema } from "@/lib/validation/task";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = taskDeclineSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid decline payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updatedTask = await declineTask(user, params.id, validation.data.declineReason);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
