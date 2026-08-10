import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getQuotations, createQuotation } from "@/lib/services/quotation.service";
import { quotationCreateSchema, quotationQuerySchema } from "@/lib/validation/quotation";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();
    const { searchParams } = new URL(req.url);

    const options = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10,
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      leadId: searchParams.get("leadId") || undefined,
      clientId: searchParams.get("clientId") || undefined,
    };

    const validation = quotationQuerySchema.safeParse(options);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid query parameters", validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const data = await getQuotations(user, validation.data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = quotationCreateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid quotation payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const newQuotation = await createQuotation(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: newQuotation,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
