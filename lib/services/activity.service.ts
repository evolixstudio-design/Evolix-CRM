import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { requireCoFounder } from "@/lib/permissions";
import { AuthUser } from "@/types";
import {
  ActivityLogItem,
  ActivityLogFilterOptions,
  PaginatedActivityLogsResponse,
} from "@/types/activity";
import { ActivityAction, EntityType, Prisma } from "@prisma/client";

export type { ActivityLogItem };

/**
 * APPEND-ONLY IMMUTABLE AUDIT LOGGING HELPER
 * Writes a new activity record to the audit trail.
 */
export async function logActivity(params: {
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata || Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
    // Non-blocking for primary application flows
    return null;
  }
}

/**
 * Format raw Prisma ActivityLog into frontend ActivityLogItem
 */
function formatActivityLog(log: any): ActivityLogItem {
  return {
    id: log.id,
    userId: log.userId,
    user: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email,
      role: log.user.role,
    },
    action: log.action as ActivityAction,
    entityType: log.entityType as EntityType,
    entityId: log.entityId || null,
    metadata: (log.metadata as Record<string, any>) || null,
    createdAt: log.createdAt.toISOString(),
  };
}

/**
 * FETCH GLOBAL ACTIVITY LOGS (CO-FOUNDER ONLY)
 * Strictly enforces HTTP 403 for Interns attempting global log access.
 */
export async function getGlobalActivityLogs(
  user: AuthUser,
  options: ActivityLogFilterOptions
): Promise<PaginatedActivityLogsResponse> {
  await requireCoFounder(user);

  const page = options.page || 1;
  const limit = options.limit || 25;
  const skip = (page - 1) * limit;

  const where: Prisma.ActivityLogWhereInput = {};

  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.entityType) where.entityType = options.entityType;
  if (options.entityId) where.entityId = options.entityId;

  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      where.createdAt.gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, rawLogs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
  ]);

  const logs = rawLogs.map((l) => formatActivityLog(l));
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    logs,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * FETCH USER OWN ACTIVITY LOGS (INTERN OR CO-FOUNDER)
 */
export async function getUserActivityLogs(
  user: AuthUser,
  targetUserId: string,
  options: ActivityLogFilterOptions
): Promise<PaginatedActivityLogsResponse> {
  // Interns can access ONLY their own logs
  if (user.role === "INTERN" && targetUserId !== user.id) {
    throw AppError.forbidden("Access restricted. Interns can view only their own activity logs.");
  }

  return getGlobalActivityLogs(
    user.role === "CO_FOUNDER" ? user : { ...user, role: "CO_FOUNDER" },
    { ...options, userId: targetUserId }
  );
}

export const getActivityLogs = getGlobalActivityLogs;
