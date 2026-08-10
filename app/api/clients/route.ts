import { NextResponse } from "next/server";
import { requireAuth, requireCoFounder } from "@/lib/permissions";
import { getClients, createClient } from "@/lib/services/client.service";
import { clientCreateSchema, clientQuerySchema } from "@/lib/validation/client";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validation = clientQuerySchema.safeParse(queryObj);
    if (!validation.success) {
      throw AppError.unprocessableEntity("Invalid search or filter parameters.");
    }

    const result = await getClients(user, validation.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();

    const body = await req.json();
    const validation = clientCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid client input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const client = await createClient(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: client,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
