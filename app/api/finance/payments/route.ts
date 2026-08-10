import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getPayments, createPayment } from "@/lib/services/finance.service";
import { paymentCreateSchema, paymentQuerySchema } from "@/lib/validation/finance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = paymentQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getPayments(user, validation.data);

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
    const validation = paymentCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid payment input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const payment = await createPayment(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
