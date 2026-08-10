import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import {
  getExpenseCategories,
  createExpenseCategory,
} from "@/lib/services/finance.service";
import { expenseCategoryCreateSchema } from "@/lib/validation/finance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireCoFounder();

    const categories = await getExpenseCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = expenseCategoryCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid category payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const newCategory = await createExpenseCategory(user, validation.data.name);

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
