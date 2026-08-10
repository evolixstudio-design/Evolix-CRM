import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getQuotationById, updateQuotationStatus, deleteQuotation } from "@/lib/services/quotation.service";
import { quotationStatusUpdateSchema } from "@/lib/validation/quotation";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const quotation = await getQuotationById(user, params.id);

    return NextResponse.json({
      success: true,
      data: quotation,
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

    if (body.status) {
      const validation = quotationStatusUpdateSchema.safeParse(body);
      if (!validation.success) {
        throw AppError.unprocessableEntity(
          "Invalid status update",
          validation.error.flatten().fieldErrors as Record<string, string[]>
        );
      }
      const updated = await updateQuotationStatus(user, params.id, validation.data.status);
      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    throw AppError.unprocessableEntity("No valid update fields provided.");
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
    const result = await deleteQuotation(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
