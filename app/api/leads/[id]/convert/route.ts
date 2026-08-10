import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { convertLeadToClient } from "@/lib/services/lead.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();

    const result = await convertLeadToClient(params.id, user.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Lead successfully converted to Client & Onboarding",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
