import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getInvoices, createInvoice } from "@/lib/services/invoice.service";
import { invoiceCreateSchema, invoiceQuerySchema } from "@/lib/validation/invoice";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // FINANCIAL SECURITY REQUIREMENT: Strict 403 Rejection for Interns
    const user = await requireCoFounder();
    const { searchParams } = new URL(req.url);

    const options = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10,
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      projectId: searchParams.get("projectId") || undefined,
      clientId: searchParams.get("clientId") || undefined,
    };

    const validation = invoiceQuerySchema.safeParse(options);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid query parameters", validation.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const data = await getInvoices(user, validation.data);

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
    // FINANCIAL SECURITY REQUIREMENT: Strict 403 Rejection for Interns
    const user = await requireCoFounder();
    const body = await req.json();

    const validation = invoiceCreateSchema.safeParse(body);
    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid invoice payload",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const newInvoice = await createInvoice(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: newInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
