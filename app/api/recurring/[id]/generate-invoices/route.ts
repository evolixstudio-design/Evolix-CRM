import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { generateScheduledInvoices } from "@/lib/services/recurring.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const result = await generateScheduledInvoices(user, params.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
