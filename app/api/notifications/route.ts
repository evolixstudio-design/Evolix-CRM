import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification.service";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    const result = await getUserNotifications(user);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    let result;
    if (body.markAll) {
      result = await markAllNotificationsAsRead(user);
    } else if (body.notificationId) {
      result = await markNotificationAsRead(user, body.notificationId);
    } else {
      result = await getUserNotifications(user);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
