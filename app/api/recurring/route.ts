import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getRecurringContracts, createRecurringContract } from "@/lib/services/recurring.service";
import { recurringContractCreateSchema, recurringQuerySchema } from "@/lib/validation/recurring";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();
    const { searchParams } = new URL(req.url);

    const queryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      projectId: searchParams.get("projectId") || undefined,
    };

    const validation = recurringQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid query parameters",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const result = await getRecurringContracts(user, validation.data);

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

    const validation = recurringContractCreateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid recurring deal payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const newContract = await createRecurringContract(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: newContract,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
