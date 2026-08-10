import { ActivityAction, EntityType } from "@prisma/client";

export interface ActivityLogItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: ActivityAction;
  entityType: EntityType;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface ActivityLogFilterOptions {
  page?: number;
  limit?: number;
  userId?: string;
  action?: ActivityAction;
  entityType?: EntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginatedActivityLogsResponse {
  logs: ActivityLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
