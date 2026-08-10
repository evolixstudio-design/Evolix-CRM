import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { acceptTask } from "@/lib/services/task.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const updatedTask = await acceptTask(user, params.id);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
