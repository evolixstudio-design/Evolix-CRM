import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import {
  getRecurringContractById,
  updateRecurringContractStatus,
  deleteRecurringContract,
} from "@/lib/services/recurring.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const contract = await getRecurringContractById(user, params.id);

    return NextResponse.json({
      success: true,
      data: contract,
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

    const updatedContract = await updateRecurringContractStatus(
      user,
      params.id,
      body.status || "ACTIVE"
    );

    return NextResponse.json({
      success: true,
      data: updatedContract,
    });
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
    const result = await deleteRecurringContract(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
