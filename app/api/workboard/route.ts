import { NextResponse } from "next/server";
import { requireCoFounder } from "@/lib/permissions";
import { getWorkboardData } from "@/lib/services/workboard.service";
import { handleApiError } from "@/lib/errors";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // SECURITY REQUIREMENT: Strict 403 Rejection for Interns
    const user = await requireCoFounder();

    const { searchParams } = new URL(req.url);
    const leaderId = searchParams.get("leaderId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const statusParam = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const dueDate = searchParams.get("dueDate") || undefined;

    const status = statusParam ? (statusParam as TaskStatus) : undefined;
    const priority = priorityParam ? (priorityParam as TaskPriority) : undefined;

    const data = await getWorkboardData(user, {
      leaderId,
      projectId,
      status,
      priority,
      dueDate,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
