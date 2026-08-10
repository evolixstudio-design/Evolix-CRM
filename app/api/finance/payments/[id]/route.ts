import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getPaymentById, updatePayment } from "@/lib/services/finance.service";
import { paymentUpdateSchema } from "@/lib/validation/finance";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const payment = await getPaymentById(user, params.id);

    return NextResponse.json({
      success: true,
      data: payment,
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
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = paymentUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid payment update payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const updated = await updatePayment(user, params.id, validation.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
