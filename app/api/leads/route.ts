import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getLeads, createLead } from "@/lib/services/lead.service";
import { leadCreateSchema, leadQuerySchema } from "@/lib/validation/lead";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = leadQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getLeads(user, validation.data);

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
    const validation = leadCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid lead input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const lead = await createLead(validation.data, user.id);

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
