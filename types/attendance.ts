export type AttendanceStatusType = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";

export interface AttendanceItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "CO_FOUNDER" | "INTERN";
  };
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO string or HH:MM AM/PM
  checkOut: string | null;
  status: AttendanceStatusType;
  notes: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodayAttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatusType | null;
  durationMinutes: number | null;
  record: AttendanceItem | null;
}

export interface AttendanceSummary {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
}

export interface AttendanceFilterOptions {
  page?: number;
  limit?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatusType;
}

export interface PaginatedAttendanceResponse {
  records: AttendanceItem[];
  summary: AttendanceSummary;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
