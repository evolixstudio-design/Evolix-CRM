import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { convertQuotationToProjectData } from "@/lib/services/quotation.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCoFounder();
    const projectData = await convertQuotationToProjectData(user, params.id);

    return NextResponse.json({
      success: true,
      data: projectData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
