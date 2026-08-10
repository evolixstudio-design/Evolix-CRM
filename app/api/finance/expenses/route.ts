import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getExpenses, createExpense } from "@/lib/services/finance.service";
import { expenseCreateSchema, expenseQuerySchema } from "@/lib/validation/finance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = expenseQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getExpenses(user, validation.data);

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
    const validation = expenseCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid expense input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const expense = await createExpense(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: expense,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
