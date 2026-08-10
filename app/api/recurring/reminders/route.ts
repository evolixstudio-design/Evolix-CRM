import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { checkAndTriggerReminders } from "@/lib/services/recurring.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireCoFounder();
    const reminders = await checkAndTriggerReminders(user);

    return NextResponse.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCoFounder();
    const reminders = await checkAndTriggerReminders(user);

    return NextResponse.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
