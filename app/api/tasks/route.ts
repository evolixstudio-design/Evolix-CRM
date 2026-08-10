import { NextResponse } from "next/server";
import { requireAuth, requireCoFounder } from "@/lib/permissions";
import { getTasks, createTask } from "@/lib/services/task.service";
import { taskCreateSchema, taskQuerySchema } from "@/lib/validation/task";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = taskQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getTasks(user, validation.data);

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
    const validation = taskCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid task input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const task = await createTask(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
