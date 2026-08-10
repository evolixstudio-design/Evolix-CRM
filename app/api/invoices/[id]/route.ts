import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getInvoiceById, updateInvoiceStatus, deleteInvoice } from "@/lib/services/invoice.service";
import { invoiceStatusUpdateSchema } from "@/lib/validation/invoice";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const invoice = await getInvoiceById(user, params.id);

    return NextResponse.json({
      success: true,
      data: invoice,
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
      const validation = invoiceStatusUpdateSchema.safeParse(body);
      if (!validation.success) {
        throw AppError.unprocessableEntity(
          "Invalid status update",
          validation.error.flatten().fieldErrors as Record<string, string[]>
        );
      }
      const updated = await updateInvoiceStatus(user, params.id, validation.data.status);
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
    const result = await deleteInvoice(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
