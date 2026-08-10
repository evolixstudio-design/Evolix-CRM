export enum MeetingType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  PHONE = "PHONE",
  GOOGLE_MEET = "GOOGLE_MEET",
  ZOOM = "ZOOM",
  OTHER = "OTHER",
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  MISSED = "MISSED",
}

export enum RecipientType {
  INTERNAL_USER = "INTERNAL_USER",
  CLIENT = "CLIENT",
}

export enum ReminderStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface MeetingReminderItem {
  id: string;
  meetingId: string;
  recipientType: RecipientType;
  recipientId: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  remindAt: string;
  channel: string;
  status: ReminderStatus;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
  recipient?: UserSummary | null;
}

export interface MeetingItem {
  id: string;
  title: string;
  leadId: string | null;
  lead?: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  clientId: string | null;
  client?: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  meetingDate: string;
  startTime: string;
  endTime: string;
  type: MeetingType;
  meetingLink: string | null;
  location: string | null;
  participants: string | null;
  notes: string | null;
  status: MeetingStatus;
  organizerId: string;
  organizer: UserSummary;
  reminders?: MeetingReminderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingFilterOptions {
  page?: number;
  limit?: number;
  view?: "today" | "upcoming" | "overdue" | "completed" | "all";
  leadId?: string;
  clientId?: string;
  organizerId?: string;
  search?: string;
}

export interface MeetingWorkAreaSummary {
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedTodayCount: number;
}
