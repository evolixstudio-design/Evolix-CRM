import { prisma } from "@/lib/db/prisma";
import { AuthUser } from "@/types";
import { NotificationType, EntityType } from "@prisma/client";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: EntityType | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserNotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
  * Fetch user notifications sorted by newest first
  */
export async function getUserNotifications(user: AuthUser): Promise<UserNotificationsResponse> {
  const [unreadCount, rawNotifications] = await Promise.all([
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const notifications: NotificationItem[] = rawNotifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    entityType: n.entityType,
    entityId: n.entityId,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return { notifications, unreadCount };
}

/**
  * Create a notification record for a given target user
  */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
}

/**
  * Mark a single notification as read
  */
export async function markNotificationAsRead(user: AuthUser, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });
  return getUserNotifications(user);
}

/**
  * Mark all user notifications as read
  */
export async function markAllNotificationsAsRead(user: AuthUser) {
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  return getUserNotifications(user);
}
