import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getTeamMembers, createInternAccount } from "@/lib/services/team.service";
import { internCreateSchema } from "@/lib/validation/team";
import { handleApiError, AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();

    const result = await getTeamMembers(user);

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
    const validation = internCreateSchema.safeParse(body);

    if (!validation.success) {
      throw AppError.unprocessableEntity(
        "Invalid intern input fields",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const member = await createInternAccount(user, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: member,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
